"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { supplierRepository } from "@/modules/suppliers/repository/supplier.repository";
import { supplierSchema } from "@/modules/suppliers/schemas/supplier.schema";

export async function listSuppliersAction() {
  const { companyId } = await requireActiveCompany();
  return supplierRepository.list(companyId);
}

export async function createSupplierAction(formData: unknown) {
  const parsed = supplierSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId } = await requireActiveCompany();
  const supplier = await supplierRepository.create(companyId, parsed.data);
  revalidatePath("/products");
  return { success: true, supplier };
}

export async function deleteSupplierAction(id: string) {
  const { companyId } = await requireActiveCompany();
  await supplierRepository.delete(companyId, id);
  revalidatePath("/products");
  return { success: true };
}
