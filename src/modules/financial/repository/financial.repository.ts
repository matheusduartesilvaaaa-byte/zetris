import { prisma } from "@/lib/prisma";
import type { AccountInput } from "@/modules/financial/schemas/account.schema";
import type { AccountListParams, CashFlowListParams } from "@/modules/financial/types/financial.types";

function buildWhere(companyId: string, params: AccountListParams) {
  return {
    companyId,
    ...(params.status ? { status: params.status as never } : {}),
  };
}

export const financialRepository = {
  // ---- Contas a pagar ----
  async listPayable(companyId: string, params: AccountListParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = buildWhere(companyId, params);

    const [data, total] = await Promise.all([
      prisma.accountPayable.findMany({
        where,
        orderBy: { dueDate: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      prisma.accountPayable.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  createPayable(companyId: string, data: AccountInput) {
    return prisma.accountPayable.create({
      data: {
        companyId,
        description: data.description,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        categoryId: data.categoryId || null,
      },
    });
  },

  findPayableById(companyId: string, id: string) {
    return prisma.accountPayable.findFirst({ where: { id, companyId } });
  },

  deletePayable(companyId: string, id: string) {
    return prisma.accountPayable.deleteMany({ where: { id, companyId } });
  },

  // ---- Contas a receber ----
  async listReceivable(companyId: string, params: AccountListParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = buildWhere(companyId, params);

    const [data, total] = await Promise.all([
      prisma.accountReceivable.findMany({
        where,
        orderBy: { dueDate: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      prisma.accountReceivable.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  createReceivable(companyId: string, data: AccountInput) {
    return prisma.accountReceivable.create({
      data: {
        companyId,
        description: data.description,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        categoryId: data.categoryId || null,
      },
    });
  },

  findReceivableById(companyId: string, id: string) {
    return prisma.accountReceivable.findFirst({ where: { id, companyId } });
  },

  deleteReceivable(companyId: string, id: string) {
    return prisma.accountReceivable.deleteMany({ where: { id, companyId } });
  },

  // ---- Categorias financeiras ----
  listCategories(companyId: string) {
    return prisma.financialCategory.findMany({ where: { companyId }, orderBy: { name: "asc" } });
  },

  // ---- Fluxo de caixa ----
  async listCashFlow(companyId: string, params: CashFlowListParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = {
      companyId,
      ...(params.type ? { type: params.type as never } : {}),
    };

    const [data, total, balanceAgg] = await Promise.all([
      prisma.cashFlowEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      prisma.cashFlowEntry.count({ where }),
      prisma.cashFlowEntry.groupBy({
        by: ["type"],
        where: { companyId },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(balanceAgg.find((b) => b.type === "INCOME")?._sum.amount ?? 0);
    const expense = Number(balanceAgg.find((b) => b.type === "EXPENSE")?._sum.amount ?? 0);

    return { data, total, page, pageSize, balance: income - expense, income, expense };
  },
};
