"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { financialService } from "@/modules/financial/services/financial.service";
import {
  accountSchema,
  financialCategorySchema,
} from "@/modules/financial/schemas/account.schema";
import type { AccountListParams, CashFlowListParams } from "@/modules/financial/types/financial.types";
import { prisma } from "@/lib/prisma";

export type ActionResult = { success: boolean; message?: string };

// Contas a pagar
export async function listPayableAction(params: AccountListParams) {
  const { companyId } = await requireActiveCompany();
  return financialService.listPayable(companyId, params);
}

export async function createPayableAction(formData: unknown): Promise<ActionResult> {
  const parsed = accountSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }
  const { companyId } = await requireActiveCompany();
  await financialService.createPayable(companyId, parsed.data);
  revalidatePath("/financial");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function payPayableAction(id: string): Promise<ActionResult> {
  const { companyId } = await requireActiveCompany();
  try {
    await financialService.payPayable(companyId, id);
    revalidatePath("/financial");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao pagar conta" };
  }
}

export async function deletePayableAction(id: string): Promise<ActionResult> {
  const { companyId } = await requireActiveCompany();
  await financialService.deletePayable(companyId, id);
  revalidatePath("/financial");
  return { success: true };
}

// Contas a receber
export async function listReceivableAction(params: AccountListParams) {
  const { companyId } = await requireActiveCompany();
  return financialService.listReceivable(companyId, params);
}

export async function createReceivableAction(formData: unknown): Promise<ActionResult> {
  const parsed = accountSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }
  const { companyId } = await requireActiveCompany();
  await financialService.createReceivable(companyId, parsed.data);
  revalidatePath("/financial");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function receivePaymentAction(id: string): Promise<ActionResult> {
  const { companyId } = await requireActiveCompany();
  try {
    await financialService.receivePayment(companyId, id);
    revalidatePath("/financial");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao receber pagamento" };
  }
}

export async function deleteReceivableAction(id: string): Promise<ActionResult> {
  const { companyId } = await requireActiveCompany();
  await financialService.deleteReceivable(companyId, id);
  revalidatePath("/financial");
  return { success: true };
}

// Categorias financeiras
export async function listFinancialCategoriesAction() {
  const { companyId } = await requireActiveCompany();
  return financialService.listCategories(companyId);
}

export async function createFinancialCategoryAction(formData: unknown) {
  const parsed = financialCategorySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }
  const { companyId } = await requireActiveCompany();
  const category = await prisma.financialCategory.create({ data: { ...parsed.data, companyId } });
  revalidatePath("/financial");
  return { success: true, category };
}

// Fluxo de caixa
export async function listCashFlowAction(params: CashFlowListParams) {
  const { companyId } = await requireActiveCompany();
  return financialService.listCashFlow(companyId, params);
}
