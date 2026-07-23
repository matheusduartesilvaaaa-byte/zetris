import { prisma } from "@/lib/prisma";
import { financialRepository } from "@/modules/financial/repository/financial.repository";
import type { AccountInput } from "@/modules/financial/schemas/account.schema";
import type { AccountListParams, CashFlowListParams } from "@/modules/financial/types/financial.types";

export const financialService = {
  listPayable(companyId: string, params: AccountListParams) {
    return financialRepository.listPayable(companyId, params);
  },
  createPayable(companyId: string, data: AccountInput) {
    return financialRepository.createPayable(companyId, data);
  },
  async deletePayable(companyId: string, id: string) {
    const existing = await financialRepository.findPayableById(companyId, id);
    if (!existing) throw new Error("Conta não encontrada.");
    await financialRepository.deletePayable(companyId, id);
    return { success: true };
  },
  async payPayable(companyId: string, id: string) {
    const account = await financialRepository.findPayableById(companyId, id);
    if (!account) throw new Error("Conta não encontrada.");
    if (account.status === "PAID") throw new Error("Esta conta já está paga.");

    return prisma.$transaction(async (tx) => {
      await tx.accountPayable.update({
        where: { id },
        data: { status: "PAID", paidAt: new Date() },
      });

      await tx.cashFlowEntry.create({
        data: {
          companyId,
          type: "EXPENSE",
          description: `Pagamento: ${account.description}`,
          amount: account.amount,
          categoryId: account.categoryId,
        },
      });

      return { success: true };
    });
  },

  listReceivable(companyId: string, params: AccountListParams) {
    return financialRepository.listReceivable(companyId, params);
  },
  createReceivable(companyId: string, data: AccountInput) {
    return financialRepository.createReceivable(companyId, data);
  },
  async deleteReceivable(companyId: string, id: string) {
    const existing = await financialRepository.findReceivableById(companyId, id);
    if (!existing) throw new Error("Conta não encontrada.");
    await financialRepository.deleteReceivable(companyId, id);
    return { success: true };
  },
  async receivePayment(companyId: string, id: string) {
    const account = await financialRepository.findReceivableById(companyId, id);
    if (!account) throw new Error("Conta não encontrada.");
    if (account.status === "PAID") throw new Error("Esta conta já foi recebida.");

    return prisma.$transaction(async (tx) => {
      await tx.accountReceivable.update({
        where: { id },
        data: { status: "PAID", receivedAt: new Date() },
      });

      await tx.cashFlowEntry.create({
        data: {
          companyId,
          type: "INCOME",
          description: `Recebimento: ${account.description}`,
          amount: account.amount,
          categoryId: account.categoryId,
        },
      });

      return { success: true };
    });
  },

  listCategories(companyId: string) {
    return financialRepository.listCategories(companyId);
  },

  listCashFlow(companyId: string, params: CashFlowListParams) {
    return financialRepository.listCashFlow(companyId, params);
  },
};
