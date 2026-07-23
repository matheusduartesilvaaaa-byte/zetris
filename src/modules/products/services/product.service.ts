import { prisma } from "@/lib/prisma";
import { productRepository } from "@/modules/products/repository/product.repository";
import type { ProductInput } from "@/modules/products/schemas/product.schema";
import type { ProductListParams } from "@/modules/products/types/product.types";

export const productService = {
  list(companyId: string, params: ProductListParams) {
    return productRepository.list(companyId, params);
  },

  getById(companyId: string, id: string) {
    return productRepository.findById(companyId, id);
  },

  async create(companyId: string, data: ProductInput) {
    return prisma.$transaction(async (tx) => {
      const { categoryId, supplierId, ...rest } = data;
      const product = await tx.product.create({
        data: {
          ...rest,
          companyId,
          categoryId: categoryId || null,
          supplierId: supplierId || null,
        },
      });

      if (product.stockQuantity > 0) {
        await tx.stockMovement.create({
          data: {
            companyId,
            productId: product.id,
            type: "INVENTORY",
            quantity: product.stockQuantity,
            reason: "Estoque inicial no cadastro do produto",
          },
        });
      }

      return product;
    });
  },

  async update(companyId: string, id: string, data: ProductInput) {
    const existing = await productRepository.findById(companyId, id);
    if (!existing) throw new Error("Produto não encontrado.");

    return prisma.$transaction(async (tx) => {
      const { categoryId, supplierId, ...rest } = data;

      await tx.product.updateMany({
        where: { id, companyId },
        data: { ...rest, categoryId: categoryId || null, supplierId: supplierId || null },
      });

      const diff = data.stockQuantity - existing.stockQuantity;
      if (diff !== 0) {
        await tx.stockMovement.create({
          data: {
            companyId,
            productId: id,
            type: "ADJUSTMENT",
            quantity: diff,
            reason: "Ajuste manual via edição de produto",
          },
        });
      }

      return tx.product.findFirst({ where: { id, companyId }, include: { category: true, supplier: true } });
    });
  },

  async delete(companyId: string, id: string) {
    const existing = await productRepository.findById(companyId, id);
    if (!existing) throw new Error("Produto não encontrado.");

    await productRepository.delete(companyId, id);
    return { success: true };
  },
};
