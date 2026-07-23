"use client";

import { useSubscription } from "@/modules/billing/hooks/use-billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export function InvoicesTable() {
  const { data: subscription } = useSubscription();
  const invoices = subscription?.invoices ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhuma fatura emitida ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-right font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{formatDate(invoice.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{invoice.status}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(Number(invoice.amount))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {invoice.hostedInvoiceUrl && (
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          Ver fatura
                        </a>
                      )}
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
