import { prisma } from "@/lib/prisma";
import type { StockMovementListParams } from "@/modules/inventory/types/inventory.types";

export const inventoryRepository = {
  async list(companyId: string, params: StockMovementListParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where = {
      companyId,
      ...(params.productId ? { productId: params.productId } : {}),
      ...(params.type ? { type: params.type as never } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { product: { select: { id: true, name: true, sku: true } } },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  findProduct(companyId: string, productId: string) {
    return prisma.product.findFirst({ where: { id: productId, companyId } });
  },
};
