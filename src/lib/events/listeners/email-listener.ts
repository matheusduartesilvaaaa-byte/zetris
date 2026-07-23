import { prisma } from "@/lib/prisma";
import { eventBus } from "@/lib/events/event-bus";
import { DomainEvent, type AuthEventPayload, type SubscriptionEventPayload } from "@/lib/events/domain-events";
import { emailService } from "@/lib/email/email.service";
import { emailTemplates } from "@/lib/email/templates";

export function registerEmailListener() {
  eventBus.on<AuthEventPayload>(DomainEvent.AUTH_USER_REGISTERED, async (payload) => {
    if (!payload.metadata?.email) return;
    const template = emailTemplates.welcome(payload.metadata.email.split("@")[0]);
    await emailService.queueEmail({ to: payload.metadata.email, ...template, template: "welcome", companyId: payload.companyId });
  });

  eventBus.on<AuthEventPayload>(DomainEvent.AUTH_PASSWORD_RESET_REQUESTED, async (payload) => {
    if (!payload.metadata?.email || !payload.metadata?.resetUrl) return;
    const template = emailTemplates.passwordReset(payload.metadata.resetUrl);
    await emailService.queueEmail({ to: payload.metadata.email, ...template, template: "password_reset" });
  });

  eventBus.on<SubscriptionEventPayload>(DomainEvent.SUBSCRIPTION_CANCELED, async (payload) => {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: payload.companyId },
      include: { company: { include: { owner: true } } },
    });
    if (!subscription) return;
    const template = emailTemplates.subscriptionCanceled();
    await emailService.queueEmail({
      to: subscription.company.owner.email,
      ...template,
      template: "subscription_canceled",
      companyId: payload.companyId,
    });
  });

  eventBus.on<SubscriptionEventPayload>(DomainEvent.INVOICE_PAID, async (payload) => {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: payload.companyId },
      include: { company: { include: { owner: true } }, plan: true },
    });
    if (!subscription) return;
    const template = emailTemplates.paymentSucceeded(`R$ ${Number(subscription.plan.priceMonthly).toFixed(2)}`);
    await emailService.queueEmail({
      to: subscription.company.owner.email,
      ...template,
      template: "payment_succeeded",
      companyId: payload.companyId,
    });
  });
}
