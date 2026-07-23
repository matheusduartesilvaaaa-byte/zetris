import { prisma } from "@/lib/prisma";

export async function calculateTicketMedio(companyId: string) {
  const result = await prisma.sale.aggregate({
    where: { companyId, status: "COMPLETED" },
    _avg: { total: true },
    _count: true,
  });
  return { average: Number(result._avg.total ?? 0), salesCount: result._count };
}

export async function calculateActiveInactiveCustomers(companyId: string, days = 90) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const totalCustomers = await prisma.customer.count({ where: { companyId } });

  const activeIds = await prisma.sale.findMany({
    where: { companyId, status: "COMPLETED", createdAt: { gte: since }, customerId: { not: null } },
    select: { customerId: true },
    distinct: ["customerId"],
  });

  const active = activeIds.length;
  return { active, inactive: Math.max(0, totalCustomers - active), total: totalCustomers };
}

/** Clientes mais importantes = maior receita total gerada. */
export async function calculateTopCustomers(companyId: string, limit = 10) {
  const grouped = await prisma.sale.groupBy({
    by: ["customerId"],
    where: { companyId, status: "COMPLETED", customerId: { not: null } },
    _sum: { total: true },
    _count: true,
    orderBy: { _sum: { total: "desc" } },
    take: limit,
  });

  const customers = await prisma.customer.findMany({
    where: { id: { in: grouped.map((g) => g.customerId!).filter(Boolean) } },
    select: { id: true, name: true },
  });

  return grouped.map((g) => ({
    customerId: g.customerId,
    name: customers.find((c) => c.id === g.customerId)?.name ?? "—",
    totalSpent: Number(g._sum.total ?? 0),
    ordersCount: g._count,
  }));
}
