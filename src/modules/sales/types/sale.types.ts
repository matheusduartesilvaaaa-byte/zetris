import type { Sale, SaleItem, Customer, Product } from "@prisma/client";

export type SaleWithRelations = Sale & {
  customer: Customer | null;
  items: (SaleItem & { product: Pick<Product, "id" | "name" | "sku"> })[];
};

export interface SaleListParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}
