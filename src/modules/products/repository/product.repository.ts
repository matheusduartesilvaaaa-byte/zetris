import { prisma } from "@/lib/prisma";
import type { ProductInput } from "@/modules/products/schemas/product.schema";
import type { ProductListParams } from "@/modules/products/types/product.types";

export const productRepository = {
  async lowStockIds(companyId: string): Promise<string[]> {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM products
      WHERE "companyId" = ${companyId} AND "stockQuantity" <= "minStock"
    `;
    return rows.map((r) => r.id);
  },

  async list(companyId: string, params: ProductListParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const lowStockFilterIds = params.lowStockOnly
      ? await productRepository.lowStockIds(companyId)
      : null;

    const where = {
      companyId,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(lowStockFilterIds ? { id: { in: lowStockFilterIds } } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" as const } },
              { sku: { contains: params.search, mode: "insensitive" as const } },
              { barcode: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true, supplier: true },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  findById(companyId: string, id: string) {
    return prisma.product.findFirst({
      where: { id, companyId },
      include: { category: true, supplier: true },
    });
  },

  findByBarcode(companyId: string, barcode: string) {
    return prisma.product.findFirst({
      where: { companyId, barcode },
      include: { category: true, supplier: true },
    });
  },

  create(companyId: string, data: ProductInput) {
    const { categoryId, supplierId, ...rest } = data;
    return prisma.product.create({
      data: {
        ...rest,
        companyId,
        categoryId: categoryId || null,
        supplierId: supplierId || null,
      },
    });
  },

  update(companyId: string, id: string, data: ProductInput) {
    const { categoryId, supplierId, ...rest } = data;
    return prisma.product.updateMany({
      where: { id, companyId },
      data: {
        ...rest,
        categoryId: categoryId || null,
        supplierId: supplierId || null,
      },
    });
  },

  delete(companyId: string, id: string) {
    return prisma.product.deleteMany({ where: { id, companyId } });
  },
};
