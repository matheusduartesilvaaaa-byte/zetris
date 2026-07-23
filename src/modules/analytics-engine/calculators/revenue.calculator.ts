import { prisma } from "@/lib/prisma";
import { startOfMonth, startOfWeek, startOfYear, subMonths, subWeeks, subYears } from "date-fns";

export type PeriodGranularity = "week" | "month" | "year";

function getPeriodBounds(granularity: PeriodGranularity) {
  const now = new Date();
  switch (granularity) {
    case "week":
      return { current: startOfWeek(now), previous: startOfWeek(subWeeks(now, 1)) };
    case "year":
      return { current: startOfYear(now), previous: startOfYear(subYears(now, 1)) };
    case "month":
    default:
      return { current: startOfMonth(now), previous: startOfMonth(subMonths(now, 1)) };
  }
}

export async function calculateRevenue(companyId: string, since?: Date) {
  const result = await prisma.sale.aggregate({
    where: { companyId, status: "COMPLETED", ...(since ? { createdAt: { gte: since } } : {}) },
    _sum: { total: true },
  });
  return Number(result._sum.total ?? 0);
}

export async function calculatePeriodComparison(companyId: string, granularity: PeriodGranularity) {
  const { current, previous } = getPeriodBounds(granularity);

  const [currentTotal, previousTotal] = await Promise.all([
    prisma.sale
      .aggregate({ where: { companyId, status: "COMPLETED", createdAt: { gte: current } }, _sum: { total: true } })
      .then((r) => Number(r._sum.total ?? 0)),
    prisma.sale
      .aggregate({
        where: { companyId, status: "COMPLETED", createdAt: { gte: previous, lt: current } },
        _sum: { total: true },
      })
      .then((r) => Number(r._sum.total ?? 0)),
  ]);

  const changePercent = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : null;

  return { granularity, currentTotal, previousTotal, changePercent };
}
