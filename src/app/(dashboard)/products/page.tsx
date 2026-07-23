import { ProductsTable } from "@/modules/products/components/products-table";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
        <p className="text-sm text-muted-foreground">Gerencie o catálogo de produtos da sua empresa</p>
      </div>
      <ProductsTable />
    </div>
  );
}
