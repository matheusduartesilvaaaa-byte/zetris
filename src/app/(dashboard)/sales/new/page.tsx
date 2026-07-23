import { SaleForm } from "@/modules/sales/components/sale-form";

export default function NewSalePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova venda</h1>
        <p className="text-sm text-muted-foreground">
          Selecione o cliente, adicione os produtos e finalize a venda
        </p>
      </div>
      <SaleForm />
    </div>
  );
}
