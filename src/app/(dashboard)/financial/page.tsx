import { FinancialTabs } from "@/modules/financial/components/financial-tabs";

export default function FinancialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Contas a pagar, contas a receber e fluxo de caixa da sua empresa
        </p>
      </div>
      <FinancialTabs />
    </div>
  );
}
