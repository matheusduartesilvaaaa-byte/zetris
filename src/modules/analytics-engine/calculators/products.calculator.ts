import { prisma } from "@/lib/prisma";

export async function calculateTopProducts(companyId: string, limit = 5) {
  const items = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { companyId, status: "COMPLETED" } },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  return attachProductNames(companyId, items);
}

export async function calculateBottomProducts(companyId: string, limit = 5) {
  const items = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { companyId, status: "COMPLETED" } },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: "asc" } },
    take: limit,
  });

  return attachProductNames(companyId, items);
}

/** Produtos com estoque > 0 mas sem nenhuma venda nos últimos `days` dias. */
export async function calculateDeadStock(companyId: string, days = 60) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const soldRecentlyIds = await prisma.saleItem.findMany({
    where: { sale: { companyId, status: "COMPLETED", createdAt: { gte: since } } },
    select: { productId: true },
    distinct: ["productId"],
  });

  const excludedIds = soldRecentlyIds.map((s) => s.productId);

  return prisma.product.findMany({
    where: { companyId, stockQuantity: { gt: 0 }, id: { notIn: excludedIds } },
    select: { id: true, name: true, stockQuantity: true },
  });
}

export function calculateOutOfStock(companyId: string) {
  return prisma.product.findMany({
    where: { companyId, stockQuantity: { lte: 0 } },
    select: { id: true, name: true },
  });
}

/**
 * Curva ABC: classifica produtos por participação acumulada na receita.
 * A (até 80% da receita), B (até 95%), C (o restante) — método clássico de
 * gestão de estoque/vendas.
 */
export async function calculateAbcCurve(companyId: string) {
  const items = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { companyId, status: "COMPLETED" } },
    _sum: { total: true },
  });

  const withNames = await attachProductNames(
    companyId,
    items.map((i) => ({ productId: i.productId, _sum: { total: i._sum.total, quantity: null } }))
  );

  const sorted = withNames.sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sorted.reduce((sum, p) => sum + p.revenue, 0);

  let cumulative = 0;
  return sorted.map((product) => {
    cumulative += product.revenue;
    const cumulativePercent = totalRevenue > 0 ? (cumulative / totalRevenue) * 100 : 0;
    const curve = cumulativePercent <= 80 ? "A" : cumulativePercent <= 95 ? "B" : "C";
    return { ...product, cumulativePercent, curve };
  });
}

async function attachProductNames(
  companyId: string,
  items: { productId: string; _sum: { quantity: number | null; total: unknown } }[]
) {
  const products = await prisma.product.findMany({
    where: { companyId, id: { in: items.map((i) => i.productId) } },
    select: { id: true, name: true },
  });

  return items.map((item) => ({
    productId: item.productId,
    name: products.find((p) => p.id === item.productId)?.name ?? "—",
    quantity: item._sum.quantity ?? 0,
    revenue: Number(item._sum.total ?? 0),
  }));
}
