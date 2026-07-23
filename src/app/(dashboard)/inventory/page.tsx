import { StockMovementsTable } from "@/modules/inventory/components/stock-movements-table";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de movimentações — entradas, saídas, ajustes e inventário
        </p>
      </div>
      <StockMovementsTable />
    </div>
  );
}
