"use server";

import { requireActiveCompany } from "@/lib/session-guard";
import { prisma } from "@/lib/prisma";
import { billingService } from "@/modules/billing/services/billing.service";
import { billingRepository } from "@/modules/billing/repository/billing.repository";

export type ActionResult = { success: boolean; message?: string; url?: string };

export async function getCurrentSubscriptionAction() {
  const { companyId } = await requireActiveCompany();
  return billingService.getSubscription(companyId);
}

export async function listPlansAction() {
  return billingRepository.listActivePlans();
}

export async function createCheckoutSessionAction(planKey: string): Promise<ActionResult> {
  const { companyId, userId } = await requireActiveCompany();

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado.");

    const session = await billingService.createCheckoutSession(companyId, user.email, planKey);
    return { success: true, url: session.url ?? undefined };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao iniciar checkout",
    };
  }
}

export async function createBillingPortalSessionAction(): Promise<ActionResult> {
  const { companyId } = await requireActiveCompany();

  try {
    const session = await billingService.createBillingPortalSession(companyId);
    return { success: true, url: session.url };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao abrir portal de cobrança",
    };
  }
}
