import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Wallet } from "lucide-react";
import { requireActiveCompany } from "@/lib/session-guard";
import { dashboardService } from "@/modules/dashboard/services/dashboard.service";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { RevenueChart } from "@/modules/dashboard/components/revenue-chart";
import { TopProductsChart } from "@/modules/dashboard/components/top-products-chart";
import { RecentSalesTable } from "@/modules/dashboard/components/recent-sales-table";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const { companyId } = await requireActiveCompany();

  const [summary, revenueSeries, topProducts, recentSales] = await Promise.all([
    dashboardService.getSummary(companyId),
    dashboardService.getMonthlyRevenue(companyId),
    dashboardService.getTopProducts(companyId),
    dashboardService.getRecentSales(companyId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Receita do mês" value={formatCurrency(summary.revenueMonth)} icon={DollarSign} />
        <StatCard label="Receita do dia" value={formatCurrency(summary.revenueDay)} icon={DollarSign} />
        <StatCard label="Vendas no mês" value={String(summary.salesCount)} icon={ShoppingCart} />
        <StatCard label="Clientes cadastrados" value={String(summary.customersCount)} icon={Users} />
        <StatCard label="Produtos cadastrados" value={String(summary.productsCount)} icon={Package} />
        <StatCard
          label="Estoque baixo"
          value={String(summary.lowStockCount)}
          icon={AlertTriangle}
          tone={summary.lowStockCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Contas a pagar"
          value={formatCurrency(summary.accountsPayable)}
          icon={Wallet}
          tone="danger"
        />
        <StatCard label="Contas a receber" value={formatCurrency(summary.accountsReceivable)} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueChart data={revenueSeries} />
        <TopProductsChart data={topProducts} />
      </div>

      <RecentSalesTable sales={recentSales} />
    </div>
  );
}
