"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { saleService } from "@/modules/sales/services/sale.service";
import { saleSchema } from "@/modules/sales/schemas/sale.schema";
import type { SaleListParams } from "@/modules/sales/types/sale.types";

export type ActionResult = { success: boolean; message?: string; saleId?: string };

export async function listSalesAction(params: SaleListParams) {
  const { companyId } = await requireActiveCompany();
  return saleService.list(companyId, params);
}

export async function createSaleAction(formData: unknown): Promise<ActionResult> {
  const parsed = saleSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId, userId } = await requireActiveCompany();

  try {
    const sale = await saleService.create(companyId, parsed.data, userId);
    revalidatePath("/sales");
    revalidatePath("/products");
    revalidatePath("/inventory");
    revalidatePath("/financial");
    revalidatePath("/dashboard");
    return { success: true, saleId: sale.id };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao registrar venda" };
  }
}

export async function cancelSaleAction(id: string): Promise<ActionResult> {
  const { companyId, userId } = await requireActiveCompany();

  try {
    await saleService.cancel(companyId, id, userId);
    revalidatePath("/sales");
    revalidatePath("/products");
    revalidatePath("/inventory");
    revalidatePath("/financial");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao cancelar venda" };
  }
}
