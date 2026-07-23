"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { productService } from "@/modules/products/services/product.service";
import { productRepository } from "@/modules/products/repository/product.repository";
import { productSchema, productUpdateSchema } from "@/modules/products/schemas/product.schema";
import type { ProductListParams } from "@/modules/products/types/product.types";

export type ActionResult = { success: boolean; message?: string };

export async function listProductsAction(params: ProductListParams) {
  const { companyId } = await requireActiveCompany();
  return productService.list(companyId, params);
}

export async function findProductByBarcodeAction(barcode: string) {
  const { companyId } = await requireActiveCompany();
  return productRepository.findByBarcode(companyId, barcode);
}

export async function createProductAction(formData: unknown): Promise<ActionResult> {
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId } = await requireActiveCompany();

  try {
    await productService.create(companyId, parsed.data);
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao salvar" };
  }
}

export async function updateProductAction(formData: unknown): Promise<ActionResult> {
  const parsed = productUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId } = await requireActiveCompany();
  const { id, ...data } = parsed.data;

  try {
    await productService.update(companyId, id, data);
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao atualizar" };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const { companyId } = await requireActiveCompany();

  try {
    await productService.delete(companyId, id);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao excluir" };
  }
}
