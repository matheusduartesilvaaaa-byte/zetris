import { ReportCard } from "@/modules/reports/components/report-card";

const REPORTS = [
  { type: "financial", title: "Financeiro", description: "Fluxo de caixa completo (entradas e saídas)" },
  { type: "customers", title: "Clientes", description: "Lista completa de clientes cadastrados" },
  { type: "products", title: "Produtos", description: "Catálogo com preços e estoque atual" },
  { type: "inventory", title: "Estoque", description: "Histórico de movimentações de estoque" },
  { type: "sales", title: "Vendas", description: "Histórico completo de vendas realizadas" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Exporte os dados da sua empresa em PDF, Excel ou CSV
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <ReportCard key={report.type} {...report} />
        ))}
      </div>
    </div>
  );
}
