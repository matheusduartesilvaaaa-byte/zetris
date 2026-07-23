import { prisma } from "@/lib/prisma";
import { calculateMargin } from "@/core/sales/sale-calculator";

export { calculateMargin };

/** Lucro bruto = receita de vendas - custo dos produtos vendidos (CMV). */
export async function calculateGrossProfit(companyId: string, since?: Date) {
  const items = await prisma.saleItem.findMany({
    where: { sale: { companyId, status: "COMPLETED", ...(since ? { createdAt: { gte: since } } : {}) } },
    include: { product: { select: { costPrice: true } } },
  });

  let revenue = 0;
  let cost = 0;
  for (const item of items) {
    revenue += Number(item.total);
    cost += Number(item.product.costPrice) * item.quantity;
  }

  return { revenue, cost, grossProfit: revenue - cost };
}

/** Lucro líquido = lucro bruto - despesas registradas no fluxo de caixa. */
export async function calculateNetProfit(companyId: string, since?: Date) {
  const { grossProfit } = await calculateGrossProfit(companyId, since);

  const expenses = await prisma.cashFlowEntry.aggregate({
    where: { companyId, type: "EXPENSE", ...(since ? { createdAt: { gte: since } } : {}) },
    _sum: { amount: true },
  });

  const totalExpenses = Number(expenses._sum.amount ?? 0);
  return { grossProfit, totalExpenses, netProfit: grossProfit - totalExpenses };
}
