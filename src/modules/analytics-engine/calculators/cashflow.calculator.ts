import { prisma } from "@/lib/prisma";

export async function calculateCashFlowSummary(companyId: string, since?: Date) {
  const where = { companyId, ...(since ? { createdAt: { gte: since } } : {}) };

  const [income, expense] = await Promise.all([
    prisma.cashFlowEntry.aggregate({ where: { ...where, type: "INCOME" }, _sum: { amount: true } }),
    prisma.cashFlowEntry.aggregate({ where: { ...where, type: "EXPENSE" }, _sum: { amount: true } }),
  ]);

  const incomeTotal = Number(income._sum.amount ?? 0);
  const expenseTotal = Number(expense._sum.amount ?? 0);

  return { income: incomeTotal, expense: expenseTotal, balance: incomeTotal - expenseTotal };
}
