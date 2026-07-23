import { prisma } from "@/lib/prisma";
import { saleRepository } from "@/modules/sales/repository/sale.repository";
import type { SaleInput } from "@/modules/sales/schemas/sale.schema";
import type { SaleListParams } from "@/modules/sales/types/sale.types";
import { calculateSaleTotals } from "@/core/sales/sale-calculator";
import { eventBus } from "@/lib/events/event-bus";
import {
  DomainEvent,
  type SaleCompletedPayload,
  type SaleCancelledPayload,
  type StockUpdatedPayload,
} from "@/lib/events/domain-events";

export const saleService = {
  list(companyId: string, params: SaleListParams) {
    return saleRepository.list(companyId, params);
  },

  getById(companyId: string, id: string) {
    return saleRepository.findById(companyId, id);
  },

  async create(companyId: string, input: SaleInput, userId?: string) {
    const productIds = input.items.map((i) => i.productId);
    const products = await saleRepository.findProducts(companyId, productIds);

    if (products.length !== new Set(productIds).size) {
      throw new Error("Um ou mais produtos não foram encontrados.");
    }

    // Valida estoque disponível para cada item antes de confirmar a venda
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (item.quantity > product.stockQuantity) {
        throw new Error(`Estoque insuficiente para "${product.name}".`);
      }
    }

    // Regra de cálculo vive na camada de domínio pura (src/core/sales),
    // não aqui — este service só orquestra I/O.
    const { items: itemsWithTotal, subtotal, total } = calculateSaleTotals(input.items, input.discount);

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          companyId,
          customerId: input.customerId || null,
          paymentMethod: input.paymentMethod,
          status: "COMPLETED",
          subtotal,
          discount: input.discount,
          total,
          items: {
            create: itemsWithTotal.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              total: item.total,
            })),
          },
        },
        include: { items: true },
      });

      // Baixa automática de estoque + movimentação
      for (const item of input.items) {
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            companyId,
            productId: item.productId,
            type: "SALE",
            quantity: -item.quantity,
            relatedSaleId: created.id,
            reason: `Venda #${created.id.slice(-6).toUpperCase()}`,
          },
        });

        eventBus.emit<StockUpdatedPayload>(DomainEvent.STOCK_UPDATED, {
          companyId,
          entityType: "Product",
          entityId: item.productId,
          metadata: { newQuantity: updatedProduct.stockQuantity },
        });
      }

      // Lançamento automático no fluxo de caixa
      await tx.cashFlowEntry.create({
        data: {
          companyId,
          type: "INCOME",
          description: `Venda #${created.id.slice(-6).toUpperCase()}`,
          amount: total,
          saleId: created.id,
        },
      });

      return created;
    });

    // Emitido SOMENTE após a transação commitar com sucesso. Quem quiser
    // reagir a isso (auditoria hoje; e-mail, ZIA, webhooks no futuro) se
    // inscreve no event bus sem que este service precise saber quem existe.
    eventBus.emit<SaleCompletedPayload>(DomainEvent.SALE_COMPLETED, {
      companyId,
      userId,
      entityType: "Sale",
      entityId: sale.id,
      metadata: { total, itemCount: sale.items.length },
    });

    return sale;
  },

  async cancel(companyId: string, id: string, userId?: string) {
    const sale = await saleRepository.findById(companyId, id);
    if (!sale) throw new Error("Venda não encontrada.");
    if (sale.status === "CANCELLED") throw new Error("Esta venda já está cancelada.");

    await prisma.$transaction(async (tx) => {
      // Restaura o estoque de cada item
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            companyId,
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            relatedSaleId: sale.id,
            reason: `Estorno da venda #${sale.id.slice(-6).toUpperCase()}`,
          },
        });
      }

      // Remove o lançamento financeiro correspondente
      await tx.cashFlowEntry.deleteMany({ where: { saleId: sale.id } });

      await tx.sale.update({ where: { id: sale.id }, data: { status: "CANCELLED" } });
    });

    eventBus.emit<SaleCancelledPayload>(DomainEvent.SALE_CANCELLED, {
      companyId,
      userId,
      entityType: "Sale",
      entityId: sale.id,
    });

    return { success: true };
  },
};
