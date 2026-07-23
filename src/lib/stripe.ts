import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };

/**
 * Cliente Stripe singleton. Toda a integração de pagamento passa por aqui —
 * nenhum outro módulo do sistema deve importar "stripe" diretamente,
 * apenas o módulo `billing/`. Isso mantém a lógica financeira isolada,
 * como pedido na arquitetura (nunca acoplar Billing ao resto do domínio).
 */
export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2024-06-20",
    typescript: true,
  });

if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
