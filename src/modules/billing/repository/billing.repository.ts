import { prisma } from "@/lib/prisma";

export const billingRepository = {
  findPlanByKey(key: string) {
    return prisma.plan.findUnique({ where: { key } });
  },

  listActivePlans() {
    return prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: "asc" } });
  },

  findSubscriptionByCompany(companyId: string) {
    return prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true, invoices: { orderBy: { createdAt: "desc" }, take: 12 } },
    });
  },

  findSubscriptionByStripeId(stripeSubscriptionId: string) {
    return prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
      include: { plan: true },
    });
  },

  findSubscriptionByStripeCustomerId(stripeCustomerId: string) {
    return prisma.subscription.findFirst({ where: { stripeCustomerId } });
  },

  createTrialSubscription(companyId: string, planId: string, trialEndsAt: Date) {
    return prisma.subscription.create({
      data: { companyId, planId, status: "TRIALING", trialEndsAt },
    });
  },

  updateSubscription(id: string, data: Parameters<typeof prisma.subscription.update>[0]["data"]) {
    return prisma.subscription.update({ where: { id }, data });
  },

  upsertInvoice(data: {
    subscriptionId: string;
    stripeInvoiceId: string;
    amount: number;
    status: string;
    hostedInvoiceUrl?: string | null;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    paidAt?: Date | null;
  }) {
    return prisma.invoice.upsert({
      where: { stripeInvoiceId: data.stripeInvoiceId },
      update: data,
      create: data,
    });
  },

  // ---- Idempotência de webhook ----
  findWebhookEvent(stripeEventId: string) {
    return prisma.webhookEvent.findUnique({ where: { stripeEventId } });
  },

  createWebhookEvent(stripeEventId: string, type: string, payload: unknown) {
    return prisma.webhookEvent.create({
      data: { stripeEventId, type, payload: payload as never },
    });
  },

  markWebhookProcessed(stripeEventId: string) {
    return prisma.webhookEvent.update({
      where: { stripeEventId },
      data: { processedAt: new Date() },
    });
  },
};
