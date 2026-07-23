import type { StockMovement, Product } from "@prisma/client";

export type StockMovementWithProduct = StockMovement & {
  product: Pick<Product, "id" | "name" | "sku">;
};

export interface StockMovementListParams {
  productId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}
