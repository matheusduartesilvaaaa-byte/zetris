"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ScanLine } from "lucide-react";
import { productSchema, type ProductInput } from "@/modules/products/schemas/product.schema";
import { useCreateProduct, useUpdateProduct } from "@/modules/products/hooks/use-products";
import { useCategories } from "@/modules/categories/hooks/use-categories";
import { useSuppliers } from "@/modules/suppliers/hooks/use-suppliers";
import type { ProductWithRelations } from "@/modules/products/types/product.types";
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
import { BarcodeScannerDialog } from "@/components/scanner/barcode-scanner-dialog";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithRelations | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const isEditing = !!product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categories } = useCategories();
  const { data: suppliers } = useSuppliers();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({ resolver: zodResolver(productSchema) });

  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              name: product.name,
              sku: product.sku ?? "",
              barcode: product.barcode ?? "",
              imageUrl: product.imageUrl ?? "",
              description: product.description ?? "",
              categoryId: product.categoryId ?? "",
              supplierId: product.supplierId ?? "",
              costPrice: Number(product.costPrice),
              salePrice: Number(product.salePrice),
              stockQuantity: product.stockQuantity,
              minStock: product.minStock,
            }
          : { costPrice: 0, salePrice: 0, stockQuantity: 0, minStock: 0 }
      );
    }
  }, [open, product, reset]);

  const costPrice = watch("costPrice");
  const salePrice = watch("salePrice");
  const margin = useMemo(() => {
    if (!costPrice || costPrice === 0) return null;
    return (((salePrice - costPrice) / costPrice) * 100).toFixed(1);
  }, [costPrice, salePrice]);

  async function onSubmit(data: ProductInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ ...data, id: product!.id })
      : await createMutation.mutateAsync(data);

    if (result.success) {
      toast.success(isEditing ? "Produto atualizado" : "Produto cadastrado");
      onOpenChange(false);
    } else {
      toast.error(result.message ?? "Erro ao salvar produto");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>Preencha os dados do produto</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de barras</Label>
              <div className="flex gap-2">
                <Input id="barcode" {...register("barcode")} />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setScannerOpen(true)}
                  title="Escanear código de barras"
                >
                  <ScanLine className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <select
                id="categoryId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("categoryId")}
              >
                <option value="">Selecione...</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierId">Fornecedor</Label>
              <select
                id="supplierId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("supplierId")}
              >
                <option value="">Selecione...</option>
                {suppliers?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de custo (R$) *</Label>
              <Input id="costPrice" type="number" step="0.01" {...register("costPrice")} />
              {errors.costPrice && (
                <p className="text-sm text-destructive">{errors.costPrice.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de venda (R$) *</Label>
              <Input id="salePrice" type="number" step="0.01" {...register("salePrice")} />
              {errors.salePrice && (
                <p className="text-sm text-destructive">{errors.salePrice.message}</p>
              )}
            </div>

            {margin && (
              <div className="sm:col-span-2 rounded-md bg-secondary/60 px-3 py-2 text-sm">
                Margem de lucro estimada: <span className="font-semibold">{margin}%</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Quantidade em estoque *</Label>
              <Input id="stockQuantity" type="number" {...register("stockQuantity")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque mínimo *</Label>
              <Input id="minStock" type="number" {...register("minStock")} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="imageUrl">URL da imagem</Label>
              <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} />
              {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" {...register("description")} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>

        <BarcodeScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onDetected={(code) => {
            setValue("barcode", code);
            toast.success(`Código lido: ${code}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
