import { prisma } from "@/lib/prisma";
import { startOfMonth } from "date-fns";

export async function calculateMrrArr() {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { plan: true },
  });

  const mrr = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.plan.priceMonthly), 0);
  return { mrr, arr: mrr * 12, activeCount: activeSubscriptions.length };
}

export async function calculateChurnRate() {
  const monthStart = startOfMonth(new Date());

  const [active, canceledThisMonth] = await Promise.all([
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "CANCELED", updatedAt: { gte: monthStart } } }),
  ]);

  const churnRate = active > 0 ? (canceledThisMonth / (active + canceledThisMonth)) * 100 : 0;
  return { churnRate, canceledThisMonth };
}

/**
 * LTV (Lifetime Value) estimado pela fórmula clássica de SaaS:
 * LTV ≈ receita média mensal por cliente ÷ taxa de churn mensal.
 * Isso É computável honestamente com os dados que já temos.
 *
 * CAC (Custo de Aquisição de Cliente) segue indisponível de propósito —
 * exigiria dados de investimento em marketing por canal, que a
 * plataforma ainda não coleta. Preferimos "sem dados" a um número inventado.
 */
export async function calculateLtvAndCac() {
  const { mrr, activeCount } = await calculateMrrArr();
  const { churnRate } = await calculateChurnRate();

  if (activeCount === 0 || churnRate === 0) {
    return { ltv: null as number | null, cac: null as number | null };
  }

  const avgRevenuePerCustomer = mrr / activeCount;
  const monthlyChurnFraction = churnRate / 100;
  const ltv = avgRevenuePerCustomer / monthlyChurnFraction;

  return { ltv, cac: null as number | null };
}
