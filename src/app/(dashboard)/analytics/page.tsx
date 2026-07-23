import { TrendingUp, TrendingDown, Users, Ticket } from "lucide-react";
import { requireActiveCompany } from "@/lib/session-guard";
import { hasFeature } from "@/lib/feature-flags/has-feature";
import { Feature } from "@/lib/feature-flags/features";
import { analyticsEngineService } from "@/modules/analytics-engine/services/analytics-engine.service";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
  const { companyId } = await requireActiveCompany();

  const enabled = await hasFeature(companyId, Feature.ANALYTICS_BASIC);
  if (!enabled) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-xl font-semibold">Zetris Analytics não está disponível no seu plano</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Faça upgrade em Configurações → Assinatura para desbloquear este módulo.
        </p>
      </div>
    );
  }

  const [ticket, comparison, customers, bottomProducts, abcCurve, deadStock] = await Promise.all([
    analyticsEngineService.getTicketMedio(companyId),
    analyticsEngineService.getPeriodComparison(companyId, "month"),
    analyticsEngineService.getActiveInactiveCustomers(companyId),
    analyticsEngineService.getBottomProducts(companyId),
    analyticsEngineService.getAbcCurve(companyId),
    analyticsEngineService.getDeadStock(companyId),
  ]);

  const curveACount = abcCurve.filter((p) => p.curve === "A").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Zetris Analytics</h1>
        <p className="text-sm text-muted-foreground">Indicadores avançados do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ticket médio" value={formatCurrency(ticket.average)} icon={Ticket} />
        <StatCard
          label="Receita vs. mês anterior"
          value={comparison.changePercent !== null ? `${comparison.changePercent.toFixed(1)}%` : "—"}
          icon={comparison.changePercent && comparison.changePercent >= 0 ? TrendingUp : TrendingDown}
          tone={comparison.changePercent !== null && comparison.changePercent < 0 ? "danger" : "default"}
        />
        <StatCard label="Clientes ativos (90 dias)" value={String(customers.active)} icon={Users} />
        <StatCard label="Clientes inativos" value={String(customers.inactive)} icon={Users} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos com menor saída</CardTitle>
          </CardHeader>
          <CardContent>
            {bottomProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
            ) : (
              <ul className="divide-y">
                {bottomProducts.map((p) => (
                  <li key={p.productId} className="flex justify-between py-2 text-sm">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">{p.quantity} un. vendida(s)</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estoque parado (sem giro há 60 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {deadStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum produto parado no momento.</p>
            ) : (
              <ul className="divide-y">
                {deadStock.map((p) => (
                  <li key={p.id} className="flex justify-between py-2 text-sm">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">{p.stockQuantity} un. em estoque</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Curva ABC de produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            {curveACount} produto(s) na categoria A (concentram até 80% da receita).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Produto</th>
                  <th className="pb-2 font-medium">Categoria</th>
                  <th className="pb-2 text-right font-medium">Receita</th>
                </tr>
              </thead>
              <tbody>
                {abcCurve.slice(0, 10).map((p) => (
                  <tr key={p.productId} className="border-b last:border-0">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                        {p.curve}
                      </span>
                    </td>
                    <td className="py-2 text-right">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Dashboards personalizados, drill-down e comparação entre filiais fazem parte dos planos superiores
        (Pro/Business/Enterprise), liberados por feature flag.
      </p>
    </div>
  );
}
