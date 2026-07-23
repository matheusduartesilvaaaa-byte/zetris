"use client";

import { useSubscription, useBillingPortal, useCheckout } from "@/modules/billing/hooks/use-billing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  TRIALING: "Em teste gratuito",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento pendente",
  CANCELED: "Cancelada",
  INCOMPLETE: "Incompleta",
  INCOMPLETE_EXPIRED: "Expirada",
  UNPAID: "Não paga",
};

const STATUS_STYLES: Record<string, string> = {
  TRIALING: "bg-blue-500/10 text-blue-600",
  ACTIVE: "bg-emerald-500/10 text-emerald-600",
  PAST_DUE: "bg-amber-500/10 text-amber-600",
  CANCELED: "bg-destructive/10 text-destructive",
};

export function CurrentPlanCard() {
  const { data: subscription, isLoading } = useSubscription();
  const portalMutation = useBillingPortal();
  const checkoutMutation = useCheckout();

  async function handleManageBilling() {
    const result = await portalMutation.mutateAsync();
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast.error(result.message ?? "Erro ao abrir portal de cobrança");
    }
  }

  async function handleSubscribeNow() {
    const result = await checkoutMutation.mutateAsync("core");
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast.error(result.message ?? "Erro ao iniciar assinatura");
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Carregando assinatura...</CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Nenhuma assinatura encontrada para esta empresa.
        </CardContent>
      </Card>
    );
  }

  const trialDaysLeft = subscription.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  const hasStripeCustomer = !!subscription.stripeCustomerId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano atual: {subscription.plan.name}</CardTitle>
        <CardDescription>{formatCurrency(Number(subscription.plan.priceMonthly))}/mês</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[subscription.status] ?? ""}`}
          >
            {STATUS_LABELS[subscription.status] ?? subscription.status}
          </span>
          {subscription.status === "TRIALING" && trialDaysLeft !== null && (
            <span className="text-sm text-muted-foreground">
              {trialDaysLeft} dia(s) restante(s) de teste gratuito
            </span>
          )}
          {subscription.currentPeriodEnd && subscription.status === "ACTIVE" && (
            <span className="text-sm text-muted-foreground">
              Renova em {formatDate(subscription.currentPeriodEnd)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {hasStripeCustomer ? (
            <Button onClick={handleManageBilling} disabled={portalMutation.isPending}>
              {portalMutation.isPending ? "Abrindo..." : "Gerenciar assinatura"}
            </Button>
          ) : (
            <Button onClick={handleSubscribeNow} disabled={checkoutMutation.isPending}>
              {checkoutMutation.isPending ? "Redirecionando..." : "Assinar agora"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
