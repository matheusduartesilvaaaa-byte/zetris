import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { billingRepository } from "@/modules/billing/repository/billing.repository";
import { eventBus } from "@/lib/events/event-bus";
import {
  DomainEvent,
  type SubscriptionEventPayload,
} from "@/lib/events/domain-events";
import { invalidateFeatureCache } from "@/lib/feature-flags/has-feature";
import type Stripe from "stripe";

const TRIAL_DAYS = 30;

export const billingService = {
  /**
   * Chamado uma única vez, no momento do cadastro da empresa. Garante que
   * toda empresa nasce com 30 dias de trial no plano Core, sem precisar de
   * cartão de crédito.
   */
  async startTrialForCompany(companyId: string) {
    const plan = await billingRepository.findPlanByKey("core");
    if (!plan) throw new Error("Plano Core não encontrado. Rode o seed do banco.");

    const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const subscription = await billingRepository.createTrialSubscription(companyId, plan.id, trialEndsAt);

    eventBus.emit<SubscriptionEventPayload>(DomainEvent.SUBSCRIPTION_TRIAL_STARTED, {
      companyId,
      entityType: "Subscription",
      entityId: subscription.id,
      metadata: { planKey: plan.key, status: subscription.status },
    });

    return subscription;
  },

  getSubscription(companyId: string) {
    return billingRepository.findSubscriptionByCompany(companyId);
  },

  /**
   * Cria (ou reaproveita) o Customer no Stripe e retorna uma sessão de
   * Checkout para o usuário assinar/fazer upgrade de plano.
   */
  async createCheckoutSession(companyId: string, userEmail: string, planKey: string) {
    const plan = await billingRepository.findPlanByKey(planKey);
    if (!plan || !plan.stripePriceId) {
      throw new Error("Plano inválido ou sem preço configurado no Stripe.");
    }

    const subscription = await billingRepository.findSubscriptionByCompany(companyId);

    let stripeCustomerId = subscription?.stripeCustomerId ?? undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { companyId },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&checkout=cancelled`,
      metadata: { companyId, planKey },
      subscription_data: { metadata: { companyId, planKey } },
    });

    return session;
  },

  /** Retorna o link do Portal do Cliente Stripe (gerenciar cartão, cancelar, ver faturas). */
  async createBillingPortalSession(companyId: string) {
    const subscription = await billingRepository.findSubscriptionByCompany(companyId);
    if (!subscription?.stripeCustomerId) {
      throw new Error("Esta empresa ainda não possui uma assinatura paga no Stripe.");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
    });

    return session;
  },

  /**
   * Processa um evento de webhook do Stripe de forma idempotente — o
   * Stripe pode reenviar o mesmo evento, e isso nunca deve gerar dados
   * duplicados ou efeitos colaterais duplicados.
   */
  async handleWebhookEvent(event: Stripe.Event) {
    const existing = await billingRepository.findWebhookEvent(event.id);
    if (existing?.processedAt) {
      logger.info({ eventId: event.id, type: event.type }, "Webhook já processado, ignorando");
      return;
    }

    if (!existing) {
      await billingRepository.createWebhookEvent(event.id, event.type, event.data.object);
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
      case "invoice.payment_failed":
        await this.onInvoiceEvent(event.data.object as Stripe.Invoice, event.type);
        break;
      default:
        logger.debug({ type: event.type }, "Evento Stripe recebido sem handler específico");
    }

    await billingRepository.markWebhookProcessed(event.id);
  },

  async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    const companyId = session.metadata?.companyId;
    if (!companyId || !session.subscription) return;

    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const local = await billingRepository.findSubscriptionByCompany(companyId);
    if (!local) return;

    const planKey = session.metadata?.planKey;
    const plan = planKey ? await billingRepository.findPlanByKey(planKey) : null;

    await billingRepository.updateSubscription(local.id, {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      status: mapStripeStatus(stripeSubscription.status),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      ...(plan ? { planId: plan.id } : {}),
    });

    eventBus.emit<SubscriptionEventPayload>(DomainEvent.SUBSCRIPTION_ACTIVATED, {
      companyId,
      entityType: "Subscription",
      entityId: local.id,
      metadata: { planKey: planKey, status: "ACTIVE" },
    });

    await invalidateFeatureCache(companyId);
  },

  async onSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const local = await billingRepository.findSubscriptionByStripeId(stripeSubscription.id);
    if (!local) return;

    const status = mapStripeStatus(stripeSubscription.status);

    await billingRepository.updateSubscription(local.id, {
      status,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    });

    eventBus.emit<SubscriptionEventPayload>(
      status === "CANCELED" ? DomainEvent.SUBSCRIPTION_CANCELED : DomainEvent.SUBSCRIPTION_PAST_DUE,
      {
        companyId: local.companyId,
        entityType: "Subscription",
        entityId: local.id,
        metadata: { status },
      }
    );
    eventBus.emit<SubscriptionEventPayload>(DomainEvent.SUBSCRIPTION_CHANGED, {
      companyId: local.companyId,
      entityType: "Subscription",
      entityId: local.id,
      metadata: { status },
    });

    await invalidateFeatureCache(local.companyId);
  },

  async onInvoiceEvent(invoice: Stripe.Invoice, type: string) {
    if (!invoice.subscription) return;

    const local = await billingRepository.findSubscriptionByStripeId(invoice.subscription as string);
    if (!local) return;

    await billingRepository.upsertInvoice({
      subscriptionId: local.id,
      stripeInvoiceId: invoice.id,
      amount: (invoice.amount_paid || invoice.amount_due) / 100,
      status: invoice.status ?? "open",
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      paidAt: type === "invoice.paid" ? new Date() : null,
    });

    if (type === "invoice.paid") {
      eventBus.emit<SubscriptionEventPayload>(DomainEvent.INVOICE_PAID, {
        companyId: local.companyId,
        entityType: "Subscription",
        entityId: local.id,
      });
      eventBus.emit<SubscriptionEventPayload>(DomainEvent.PAYMENT_CONFIRMED, {
        companyId: local.companyId,
        entityType: "Subscription",
        entityId: local.id,
      });
    } else {
      eventBus.emit<SubscriptionEventPayload>(DomainEvent.PAYMENT_FAILED, {
        companyId: local.companyId,
        entityType: "Subscription",
        entityId: local.id,
      });
    }
  },
};

function mapStripeStatus(status: Stripe.Subscription.Status) {
  const map: Record<Stripe.Subscription.Status, string> = {
    trialing: "TRIALING",
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    unpaid: "UNPAID",
    paused: "PAST_DUE",
  };
  return map[status] as never;
}
