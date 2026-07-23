import { SalesTable } from "@/modules/sales/components/sales-table";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendas</h1>
        <p className="text-sm text-muted-foreground">Histórico de vendas da sua empresa</p>
      </div>
      <SalesTable />
    </div>
  );
}
