"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useStockMovements } from "@/modules/inventory/hooks/use-inventory";
import { StockMovementDialog } from "@/modules/inventory/components/stock-movement-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Saída",
  ADJUSTMENT: "Ajuste",
  SALE: "Venda",
  INVENTORY: "Inventário",
};

const TYPE_STYLES: Record<string, string> = {
  IN: "bg-emerald-500/10 text-emerald-600",
  OUT: "bg-destructive/10 text-destructive",
  ADJUSTMENT: "bg-amber-500/10 text-amber-600",
  SALE: "bg-blue-500/10 text-blue-600",
  INVENTORY: "bg-secondary text-secondary-foreground",
};

export function StockMovementsTable() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useStockMovements({ page, pageSize: 20 });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova movimentação
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Quantidade</th>
                  <th className="px-4 py-3 font-medium">Motivo</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                )}
                {!isLoading && data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Nenhuma movimentação registrada ainda
                    </td>
                  </tr>
                )}
                {data?.data.map((movement) => (
                  <tr key={movement.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{movement.product.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[movement.type] ?? ""}`}
                      >
                        {TYPE_LABELS[movement.type] ?? movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{movement.reason || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(movement.createdAt)}
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
            Página {data.page} de {totalPages} • {data.total} movimentação(ões)
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

      <StockMovementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
