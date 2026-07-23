import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { billingService } from "@/modules/billing/services/billing.service";
import { logger } from "@/lib/logger";

/**
 * O Stripe exige o corpo bruto (não parseado) da requisição para validar a
 * assinatura do webhook — por isso essa rota nunca deve usar `request.json()`.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    logger.error({ err: error }, "Falha ao validar assinatura do webhook Stripe");
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    await billingService.handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ err: error, eventType: event.type }, "Erro ao processar webhook Stripe");
    // Retornamos 500 de propósito: o Stripe vai reenviar o evento depois,
    // e nosso processamento é idempotente (WebhookEvent + upsert de Invoice).
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
