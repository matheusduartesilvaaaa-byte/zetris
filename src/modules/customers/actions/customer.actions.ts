"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { customerService } from "@/modules/customers/services/customer.service";
import {
  customerSchema,
  customerUpdateSchema,
} from "@/modules/customers/schemas/customer.schema";
import type { CustomerListParams } from "@/modules/customers/types/customer.types";

export type ActionResult = { success: boolean; message?: string };

export async function listCustomersAction(params: CustomerListParams) {
  const { companyId } = await requireActiveCompany();
  return customerService.list(companyId, params);
}

export async function createCustomerAction(formData: unknown): Promise<ActionResult> {
  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId, userId } = await requireActiveCompany();

  try {
    await customerService.create(companyId, parsed.data, userId);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao salvar" };
  }
}

export async function updateCustomerAction(formData: unknown): Promise<ActionResult> {
  const parsed = customerUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId, userId } = await requireActiveCompany();
  const { id, ...data } = parsed.data;

  try {
    await customerService.update(companyId, id, data, userId);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao atualizar" };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  const { companyId, userId } = await requireActiveCompany();

  try {
    await customerService.delete(companyId, id, userId);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao excluir" };
  }
}
