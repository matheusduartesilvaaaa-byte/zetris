import { prisma } from "@/lib/prisma";
import { startOfMonth, startOfDay, subMonths, format } from "date-fns";

export const dashboardService = {
  /** Comparação entre colunas (stockQuantity <= minStock) exige SQL raw no Prisma. */
  async countLowStockProducts(companyId: string): Promise<number> {
    const result = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count
      FROM products
      WHERE "companyId" = ${companyId}
        AND "stockQuantity" <= "minStock"
    `;
    return Number(result[0]?.count ?? 0);
  },

  async getSummary(companyId: string) {
    const monthStart = startOfMonth(new Date());
    const dayStart = startOfDay(new Date());

    const [
      revenueMonth,
      revenueDay,
      salesCount,
      customersCount,
      productsCount,
      lowStockCount,
      payableCount,
      receivableCount,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { companyId, status: "COMPLETED", createdAt: { gte: monthStart } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { companyId, status: "COMPLETED", createdAt: { gte: dayStart } },
        _sum: { total: true },
      }),
      prisma.sale.count({ where: { companyId, status: "COMPLETED", createdAt: { gte: monthStart } } }),
      prisma.customer.count({ where: { companyId } }),
      prisma.product.count({ where: { companyId } }),
      dashboardService.countLowStockProducts(companyId),
      prisma.accountPayable.aggregate({
        where: { companyId, status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { amount: true },
      }),
      prisma.accountReceivable.aggregate({
        where: { companyId, status: { in: ["PENDING", "OVERDUE"] } },
        _sum: { amount: true },
      }),
    ]);

    return {
      revenueMonth: Number(revenueMonth._sum.total ?? 0),
      revenueDay: Number(revenueDay._sum.total ?? 0),
      salesCount,
      customersCount,
      productsCount,
      lowStockCount,
      accountsPayable: Number(payableCount._sum.amount ?? 0),
      accountsReceivable: Number(receivableCount._sum.amount ?? 0),
    };
  },

  async getMonthlyRevenue(companyId: string, months = 6) {
    const start = startOfMonth(subMonths(new Date(), months - 1));

    const sales = await prisma.sale.findMany({
      where: { companyId, status: "COMPLETED", createdAt: { gte: start } },
      select: { total: true, createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < months; i++) {
      const key = format(subMonths(new Date(), months - 1 - i), "MMM/yy");
      buckets.set(key, 0);
    }

    for (const sale of sales) {
      const key = format(sale.createdAt, "MMM/yy");
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + Number(sale.total));
      }
    }

    return Array.from(buckets.entries()).map(([month, total]) => ({ month, total }));
  },

  async getTopProducts(companyId: string, limit = 5) {
    const items = await prisma.saleItem.groupBy({
      by: ["productId"],
      where: { sale: { companyId, status: "COMPLETED" } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true, name: true },
    });

    return items.map((item) => ({
      name: products.find((p) => p.id === item.productId)?.name ?? "—",
      quantity: item._sum.quantity ?? 0,
    }));
  },

  async getRecentSales(companyId: string, limit = 5) {
    return prisma.sale.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { customer: { select: { name: true } } },
    });
  },
};
