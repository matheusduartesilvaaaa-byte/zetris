"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useReceivable,
  useCreateReceivable,
  useReceivePayment,
  useDeleteReceivable,
} from "@/modules/financial/hooks/use-financial";
import { AccountFormDialog } from "@/modules/financial/components/account-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Recebido",
  OVERDUE: "Atrasado",
  CANCELLED: "Cancelado",
};

export function ReceivableTable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useReceivable({ pageSize: 50 });
  const createMutation = useCreateReceivable();
  const receiveMutation = useReceivePayment();
  const deleteMutation = useDeleteReceivable();

  async function handleReceive(id: string) {
    const result = await receiveMutation.mutateAsync(id);
    if (result.success) {
      toast.success("Recebimento lançado no fluxo de caixa");
    } else {
      toast.error(result.message ?? "Erro ao registrar recebimento");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta conta?")) return;
    await deleteMutation.mutateAsync(id);
    toast.success("Conta excluída");
  }

  function isOverdue(dueDate: Date | string, status: string) {
    return status === "PENDING" && new Date(dueDate) < new Date();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova conta a receber
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
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
                      Nenhuma conta a receber cadastrada
                    </td>
                  </tr>
                )}
                {data?.data.map((account) => {
                  const overdue = isOverdue(account.dueDate, account.status);
                  return (
                    <tr key={account.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{account.description}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(account.dueDate)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            account.status === "PAID"
                              ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
                              : overdue
                                ? "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                                : "rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600"
                          }
                        >
                          {overdue && account.status === "PENDING" ? "Atrasado" : STATUS_LABELS[account.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(Number(account.amount))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {account.status !== "PAID" && (
                            <Button variant="ghost" size="icon" onClick={() => handleReceive(account.id)}>
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Nova conta a receber"
        onSubmit={(data) => createMutation.mutateAsync(data)}
      />
    </div>
  );
}
