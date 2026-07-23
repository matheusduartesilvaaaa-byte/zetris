"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  stockMovementSchema,
  type StockMovementInput,
} from "@/modules/inventory/schemas/stock-movement.schema";
import { useCreateStockMovement } from "@/modules/inventory/hooks/use-inventory";
import { useProducts } from "@/modules/products/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TYPE_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Saída",
  ADJUSTMENT: "Ajuste manual (nova quantidade)",
  INVENTORY: "Inventário (recontagem)",
};

export function StockMovementDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [type, setType] = useState<string>("IN");
  const mutation = useCreateStockMovement();
  const { data: productsData } = useProducts({ pageSize: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockMovementInput>({ resolver: zodResolver(stockMovementSchema) });

  const isAbsolute = type === "ADJUSTMENT" || type === "INVENTORY";

  async function onSubmit(data: StockMovementInput) {
    const result = await mutation.mutateAsync(data);
    if (result.success) {
      toast.success("Movimentação registrada");
      reset();
      onOpenChange(false);
    } else {
      toast.error(result.message ?? "Erro ao registrar movimentação");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova movimentação de estoque</DialogTitle>
          <DialogDescription>
            Registre entradas, saídas, ajustes ou inventário. O estoque do produto é atualizado
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Produto *</Label>
            <select
              id="productId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("productId")}
            >
              <option value="">Selecione...</option>
              {productsData?.data.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (estoque atual: {p.stockQuantity})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-sm text-destructive">{errors.productId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("type")}
              onChange={(e) => setType(e.target.value)}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {isAbsolute ? "Nova quantidade em estoque *" : "Quantidade *"}
            </Label>
            <Input id="quantity" type="number" min={0} {...register("quantity")} />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo / observação</Label>
            <Input id="reason" placeholder="Ex: compra do fornecedor X" {...register("reason")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
