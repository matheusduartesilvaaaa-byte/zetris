"use client";

import { useCashFlow } from "@/modules/financial/hooks/use-financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export function CashFlowView() {
  const { data, isLoading } = useCashFlow({ pageSize: 30 });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Saldo atual</p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(data?.balance ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total de entradas</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {formatCurrency(data?.income ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total de saídas</p>
            <p className="mt-1 text-2xl font-semibold text-destructive">
              {formatCurrency(data?.expense ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      Nenhuma movimentação registrada ainda
                    </td>
                  </tr>
                )}
                {data?.data.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{entry.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          entry.type === "INCOME"
                            ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
                            : "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                        }
                      >
                        {entry.type === "INCOME" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        entry.type === "INCOME" ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      {entry.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(Number(entry.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
