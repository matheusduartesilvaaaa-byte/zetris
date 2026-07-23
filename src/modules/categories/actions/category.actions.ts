"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { categoryRepository } from "@/modules/categories/repository/category.repository";
import { categorySchema } from "@/modules/categories/schemas/category.schema";

export async function listCategoriesAction() {
  const { companyId } = await requireActiveCompany();
  return categoryRepository.list(companyId);
}

export async function createCategoryAction(formData: unknown) {
  const parsed = categorySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId } = await requireActiveCompany();
  const category = await categoryRepository.create(companyId, parsed.data);
  revalidatePath("/products");
  return { success: true, category };
}

export async function deleteCategoryAction(id: string) {
  const { companyId } = await requireActiveCompany();
  await categoryRepository.delete(companyId, id);
  revalidatePath("/products");
  return { success: true };
}
