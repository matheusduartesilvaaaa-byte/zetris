/**
 * Catálogo de eventos de domínio da Zetris.
 *
 * Qualquer módulo pode emitir um evento daqui sem conhecer quem está
 * "escutando" (auditoria, e-mail, IA, webhooks futuros). Isso é o que
 * permite adicionar novos efeitos colaterais (ex: "avisar a ZIA quando uma
 * venda for concluída") sem tocar no módulo de Vendas.
 *
 * Ao adicionar um novo módulo (Billing, Analytics, etc.), adicione aqui os
 * eventos que ele emite — nunca importe um módulo dentro do outro para
 * "avisar" sobre algo.
 */
export const DomainEvent = {
  SALE_COMPLETED: "sale.completed",
  SALE_CANCELLED: "sale.cancelled",
  PRODUCT_LOW_STOCK: "product.low_stock",
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",
  CUSTOMER_DELETED: "customer.deleted",
  ACCOUNT_PAYABLE_PAID: "account_payable.paid",
  ACCOUNT_RECEIVABLE_RECEIVED: "account_receivable.received",

  // Billing
  SUBSCRIPTION_TRIAL_STARTED: "subscription.trial_started",
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  SUBSCRIPTION_CANCELED: "subscription.canceled",
  SUBSCRIPTION_PAST_DUE: "subscription.past_due",
  SUBSCRIPTION_CHANGED: "subscription.changed",
  INVOICE_PAID: "invoice.paid",
  PAYMENT_CONFIRMED: "payment.confirmed",
  PAYMENT_FAILED: "payment.failed",

  // Autenticação
  AUTH_USER_REGISTERED: "auth.user_registered",
  AUTH_PASSWORD_RESET_REQUESTED: "auth.password_reset_requested",
  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",

  // Estoque (genérico, além dos tipos específicos de StockMovement)
  STOCK_UPDATED: "stock.updated",

  // IA e Forecast
  AI_CONVERSATION_CREATED: "ai.conversation_created",
  FORECAST_FINISHED: "forecast.finished",
} as const;

export type DomainEventName = (typeof DomainEvent)[keyof typeof DomainEvent];

/** Payload base que todo evento carrega, para viabilizar auditoria genérica. */
export interface BaseEventPayload {
  companyId?: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

export interface SaleCompletedPayload extends BaseEventPayload {
  entityType: "Sale";
  entityId: string;
  metadata: { total: number; itemCount: number };
}

export interface SaleCancelledPayload extends BaseEventPayload {
  entityType: "Sale";
  entityId: string;
}

export interface CustomerEventPayload extends BaseEventPayload {
  entityType: "Customer";
  entityId: string;
}

export interface SubscriptionEventPayload extends BaseEventPayload {
  entityType: "Subscription";
  entityId: string;
  metadata?: { planKey?: string; status?: string };
}

export interface AuthEventPayload extends BaseEventPayload {
  entityType: "User";
  entityId: string;
  metadata?: { email?: string; resetUrl?: string };
}

export interface StockUpdatedPayload extends BaseEventPayload {
  entityType: "Product";
  entityId: string;
  metadata: { newQuantity: number };
}

export interface AiConversationPayload extends BaseEventPayload {
  entityType: "AiConversation";
  entityId: string;
}

export interface ForecastFinishedPayload extends BaseEventPayload {
  entityType: "Forecast";
  metadata: { kind: string; horizonDays: number };
}
