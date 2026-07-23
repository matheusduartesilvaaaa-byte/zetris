import { prisma } from "@/lib/prisma";
import type { SaleListParams } from "@/modules/sales/types/sale.types";

export const saleRepository = {
  async list(companyId: string, params: SaleListParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where = {
      companyId,
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.search
        ? { customer: { name: { contains: params.search, mode: "insensitive" as const } } }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customer: true,
          items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  findById(companyId: string, id: string) {
    return prisma.sale.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    });
  },

  findProducts(companyId: string, productIds: string[]) {
    return prisma.product.findMany({ where: { companyId, id: { in: productIds } } });
  },
};
