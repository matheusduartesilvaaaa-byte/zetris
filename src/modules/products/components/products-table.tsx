"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useDeleteProduct } from "@/modules/products/hooks/use-products";
import { ProductFormDialog } from "@/modules/products/components/product-form-dialog";
import type { ProductWithRelations } from "@/modules/products/types/product.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function ProductsTable() {
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

  const { data, isLoading } = useProducts({ search, lowStockOnly, page, pageSize: 20 });
  const deleteMutation = useDeleteProduct();

  function handleNew() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleEdit(product: ProductWithRelations) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const result = await deleteMutation.mutateAsync(id);
    if (result.success) {
      toast.success("Produto excluído");
    } else {
      toast.error(result.message ?? "Erro ao excluir produto");
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, SKU, código de barras..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button
            variant={lowStockOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setLowStockOnly((v) => !v);
              setPage(1);
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" /> Estoque baixo
          </Button>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo produto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Preço venda</th>
                  <th className="px-4 py-3 font-medium">Estoque</th>
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
                      Nenhum produto encontrado
                    </td>
                  </tr>
                )}
                {data?.data.map((product) => {
                  const isLow = product.stockQuantity <= product.minStock;
                  return (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="font-medium">{product.name}</div>
                        {product.sku && (
                          <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(Number(product.salePrice))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isLow
                              ? "inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600"
                              : "text-muted-foreground"
                          }
                        >
                          {isLow && <AlertTriangle className="h-3 w-3" />}
                          {product.stockQuantity} un.
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
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

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {data.page} de {totalPages} • {data.total} produto(s)
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

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} />
    </div>
  );
}
