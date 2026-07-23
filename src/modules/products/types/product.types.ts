import type { Product, Category, Supplier } from "@prisma/client";

export type ProductWithRelations = Product & {
  category: Category | null;
  supplier: Supplier | null;
};

export interface ProductListParams {
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  data: ProductWithRelations[];
  total: number;
  page: number;
  pageSize: number;
}
