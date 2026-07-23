"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { inventoryService } from "@/modules/inventory/services/inventory.service";
import { stockMovementSchema } from "@/modules/inventory/schemas/stock-movement.schema";
import type { StockMovementListParams } from "@/modules/inventory/types/inventory.types";

export type ActionResult = { success: boolean; message?: string };

export async function listStockMovementsAction(params: StockMovementListParams) {
  const { companyId } = await requireActiveCompany();
  return inventoryService.list(companyId, params);
}

export async function createStockMovementAction(formData: unknown): Promise<ActionResult> {
  const parsed = stockMovementSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId } = await requireActiveCompany();

  try {
    await inventoryService.createMovement(companyId, parsed.data);
    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao registrar movimentação",
    };
  }
}
