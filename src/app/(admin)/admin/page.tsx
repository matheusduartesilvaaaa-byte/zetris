import { DollarSign, Building2, Users, TrendingUp, TrendingDown, Bot, Activity } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/admin-guard";
import { platformAdminService } from "@/modules/platform-admin/services/platform-admin.service";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminPage() {
  await requirePlatformAdmin();

  const [revenue, companies, users, unitEconomics, recentCompanies, aiUsage, systemHealth, recentPayments, auditLogs] =
    await Promise.all([
      platformAdminService.getRevenueMetrics(),
      platformAdminService.getCompanyMetrics(),
      platformAdminService.getUserMetrics(),
      platformAdminService.getUnitEconomics(),
      platformAdminService.getRecentCompanies(),
      platformAdminService.getAiUsageMetrics(),
      platformAdminService.getSystemHealth(),
      platformAdminService.getRecentPayments(),
      platformAdminService.getAuditLogs(20),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visão geral da operação</h1>
          <p className="text-sm text-muted-foreground">Métricas de negócio da plataforma Zetris</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${systemHealth.databaseOk ? "bg-emerald-500" : "bg-destructive"}`} />
          Banco {systemHealth.databaseOk ? "OK" : "com problema"} ({systemHealth.databaseLatencyMs}ms)
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value={formatCurrency(revenue.mrr)} icon={DollarSign} />
        <StatCard label="ARR" value={formatCurrency(revenue.arr)} icon={DollarSign} />
        <StatCard label="Receita total recebida" value={formatCurrency(revenue.totalRevenue)} icon={DollarSign} />
        <StatCard label="Assinaturas ativas" value={String(revenue.activeSubscriptionsCount)} icon={Building2} />

        <StatCard label="Empresas totais" value={String(companies.totalCompanies)} icon={Building2} />
        <StatCard label="Empresas em trial" value={String(companies.trialingCompanies)} icon={Building2} tone="warning" />
        <StatCard label="Empresas canceladas" value={String(companies.canceledCompanies)} icon={Building2} tone="danger" />
        <StatCard label="Usuários totais" value={String(users.totalUsers)} icon={Users} />

        <StatCard
          label="Crescimento mensal"
          value={companies.growthRate !== null ? `${companies.growthRate.toFixed(1)}%` : "—"}
          icon={companies.growthRate && companies.growthRate >= 0 ? TrendingUp : TrendingDown}
        />
        <StatCard label="Churn Rate" value={`${companies.churnRate.toFixed(1)}%`} icon={TrendingDown} tone="danger" />
        <StatCard label="LTV estimado" value={unitEconomics.ltv ? formatCurrency(unitEconomics.ltv) : "Sem dados ainda"} icon={DollarSign} />
        <StatCard label="CAC" value={unitEconomics.cac ? formatCurrency(unitEconomics.cac) : "Sem dados ainda"} icon={DollarSign} />

        <StatCard label="Mensagens ZIA (mês)" value={String(aiUsage.messagesThisMonth)} icon={Bot} />
        <StatCard label="Conversas ZIA (total)" value={String(aiUsage.conversationsTotal)} icon={Bot} />
        <StatCard label="Uptime do processo" value={`${Math.floor(systemHealth.processUptimeSeconds / 60)} min`} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Empresas recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Empresa</th>
                    <th className="px-4 py-3 font-medium">Plano</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCompanies.map((company) => (
                    <tr key={company.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{company.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{company.subscription?.plan.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{company.subscription?.status ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamentos recentes (Stripe)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Empresa</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                        Nenhum pagamento processado ainda
                      </td>
                    </tr>
                  )}
                  {recentPayments.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{invoice.subscription.company.name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(Number(invoice.amount))}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(invoice.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auditoria recente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Ação</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.company?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        CAC aparece como "sem dados ainda" de propósito — a plataforma ainda não coleta custo de aquisição
        por canal de marketing. LTV já é calculado com fórmula real (receita média ÷ churn).
      </p>
    </div>
  );
}
