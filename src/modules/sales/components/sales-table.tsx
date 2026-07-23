"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useSales, useCancelSale } from "@/modules/sales/hooks/use-sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-secondary text-secondary-foreground",
  COMPLETED: "bg-emerald-500/10 text-emerald-600",
  CANCELLED: "bg-destructive/10 text-destructive",
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  DEBIT_CARD: "Débito",
  CREDIT_CARD: "Crédito",
  PIX: "Pix",
  BANK_TRANSFER: "Transferência",
  OTHER: "Outro",
};

export function SalesTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSales({ page, pageSize: 20 });
  const cancelMutation = useCancelSale();

  async function handleCancel(id: string) {
    if (!confirm("Tem certeza que deseja cancelar esta venda? O estoque será restaurado.")) return;

    const result = await cancelMutation.mutateAsync(id);
    if (result.success) {
      toast.success("Venda cancelada e estoque restaurado");
    } else {
      toast.error(result.message ?? "Erro ao cancelar venda");
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/sales/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova venda
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Itens</th>
                  <th className="px-4 py-3 font-medium">Pagamento</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                      Nenhuma venda registrada ainda
                    </td>
                  </tr>
                )}
                {data?.data.map((sale) => (
                  <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      {sale.customer?.name ?? "Consumidor final"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{sale.items.length} item(ns)</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[sale.status]}`}
                      >
                        {STATUS_LABELS[sale.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(Number(sale.total))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {sale.status === "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleCancel(sale.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {data.page} de {totalPages} • {data.total} venda(s)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
