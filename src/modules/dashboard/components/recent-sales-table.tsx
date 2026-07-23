import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RecentSale {
  id: string;
  total: unknown;
  createdAt: Date;
  paymentMethod: string;
  customer: { name: string } | null;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  DEBIT_CARD: "Débito",
  CREDIT_CARD: "Crédito",
  PIX: "Pix",
  BANK_TRANSFER: "Transferência",
  OTHER: "Outro",
};

export function RecentSalesTable({ sales }: { sales: RecentSale[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas vendas</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Pagamento</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b last:border-0">
                    <td className="py-2.5">{sale.customer?.name ?? "Consumidor final"}</td>
                    <td className="py-2.5 text-muted-foreground">
                      {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{formatDate(sale.createdAt)}</td>
                    <td className="py-2.5 text-right font-medium">
                      {formatCurrency(Number(sale.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
