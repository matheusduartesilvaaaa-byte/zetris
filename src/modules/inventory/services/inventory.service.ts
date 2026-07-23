import { prisma } from "@/lib/prisma";
import { inventoryRepository } from "@/modules/inventory/repository/inventory.repository";
import type { StockMovementInput } from "@/modules/inventory/schemas/stock-movement.schema";
import type { StockMovementListParams } from "@/modules/inventory/types/inventory.types";
import { eventBus } from "@/lib/events/event-bus";
import { DomainEvent, type StockUpdatedPayload } from "@/lib/events/domain-events";

export const inventoryService = {
  list(companyId: string, params: StockMovementListParams) {
    return inventoryRepository.list(companyId, params);
  },

  /**
   * Para IN/OUT: `quantity` é a quantidade movimentada.
   * Para ADJUSTMENT/INVENTORY: `quantity` é a NOVA quantidade absoluta em estoque
   * (o produto é recontado e o sistema calcula a diferença automaticamente).
   */
  async createMovement(companyId: string, input: StockMovementInput) {
    const product = await inventoryRepository.findProduct(companyId, input.productId);
    if (!product) throw new Error("Produto não encontrado.");

    return prisma.$transaction(async (tx) => {
      let newStock: number;
      let movementQuantity: number;

      switch (input.type) {
        case "IN":
          newStock = product.stockQuantity + input.quantity;
          movementQuantity = input.quantity;
          break;
        case "OUT":
          if (input.quantity > product.stockQuantity) {
            throw new Error("Quantidade de saída maior que o estoque disponível.");
          }
          newStock = product.stockQuantity - input.quantity;
          movementQuantity = -input.quantity;
          break;
        case "ADJUSTMENT":
        case "INVENTORY":
          newStock = input.quantity;
          movementQuantity = input.quantity - product.stockQuantity;
          break;
        default:
          throw new Error("Tipo de movimentação inválido.");
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          companyId,
          productId: product.id,
          type: input.type,
          quantity: movementQuantity,
          reason: input.reason || null,
        },
      });

      return { movement, newStock };
    }).then(async ({ movement, newStock }) => {
      eventBus.emit<StockUpdatedPayload>(DomainEvent.STOCK_UPDATED, {
        companyId,
        entityType: "Product",
        entityId: product.id,
        metadata: { newQuantity: newStock },
      });
      return movement;
    });
  },
};
