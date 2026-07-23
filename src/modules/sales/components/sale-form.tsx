"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ScanLine } from "lucide-react";
import { saleSchema, type SaleInput } from "@/modules/sales/schemas/sale.schema";
import { useCreateSale } from "@/modules/sales/hooks/use-sales";
import { useCustomers } from "@/modules/customers/hooks/use-customers";
import { useProducts, useFindProductByBarcode } from "@/modules/products/hooks/use-products";
import { BarcodeScannerDialog } from "@/components/scanner/barcode-scanner-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  DEBIT_CARD: "Cartão de débito",
  CREDIT_CARD: "Cartão de crédito",
  PIX: "Pix",
  BANK_TRANSFER: "Transferência bancária",
  OTHER: "Outro",
};

export function SaleForm() {
  const router = useRouter();
  const createMutation = useCreateSale();
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const { data: productsData } = useProducts({ pageSize: 200 });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      paymentMethod: "CASH",
      discount: 0,
      items: [{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const saleDiscount = watch("discount");
  const [scannerOpen, setScannerOpen] = useState(false);
  const findByBarcode = useFindProductByBarcode();

  async function handleBarcodeDetected(code: string) {
    const product = await findByBarcode.mutateAsync(code);
    if (!product) {
      toast.error(`Nenhum produto encontrado com o código "${code}"`);
      return;
    }

    // Se o produto já está na venda, só aumenta a quantidade
    const existingIndex = items.findIndex((item) => item.productId === product.id);
    if (existingIndex >= 0) {
      setValue(`items.${existingIndex}.quantity`, Number(items[existingIndex].quantity) + 1);
    } else {
      append({
        productId: product.id,
        quantity: 1,
        unitPrice: Number(product.salePrice),
        discount: 0,
      });
    }
    toast.success(`${product.name} adicionado à venda`);
  }

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0
      ),
    [items]
  );
  const total = subtotal - (Number(saleDiscount) || 0);

  function handleProductChange(index: number, productId: string) {
    const product = productsData?.data.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.unitPrice`, Number(product.salePrice));
    }
  }

  async function onSubmit(data: SaleInput) {
    const result = await createMutation.mutateAsync(data);
    if (result.success) {
      toast.success("Venda registrada com sucesso");
      router.push("/sales");
    } else {
      toast.error(result.message ?? "Erro ao registrar venda");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da venda</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerId">Cliente</Label>
            <select
              id="customerId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("customerId")}
            >
              <option value="">Consumidor final</option>
              {customersData?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de pagamento *</Label>
            <select
              id="paymentMethod"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("paymentMethod")}
            >
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Itens da venda</CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
              <ScanLine className="mr-2 h-4 w-4" /> Escanear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, discount: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar produto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {errors.items?.message && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
            >
              <div className="space-y-1">
                <Label className="text-xs">Produto</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...register(`items.${index}.productId`)}
                  onChange={(e) => {
                    register(`items.${index}.productId`).onChange(e);
                    handleProductChange(index, e.target.value);
                  }}
                >
                  <option value="">Selecione...</option>
                  {productsData?.data.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (est: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Quantidade</Label>
                <Input type="number" min={1} {...register(`items.${index}.quantity`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Preço unitário</Label>
                <Input type="number" step="0.01" {...register(`items.${index}.unitPrice`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Desconto</Label>
                <Input type="number" step="0.01" {...register(`items.${index}.discount`)} />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="discount" className="text-sm text-muted-foreground">
              Desconto na venda
            </Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              className="w-32 text-right"
              {...register("discount")}
            />
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/sales")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Finalizando..." : "Finalizar venda"}
        </Button>
      </div>

      <BarcodeScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onDetected={handleBarcodeDetected} />
    </form>
  );
}
