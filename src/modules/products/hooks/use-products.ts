"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  findProductByBarcodeAction,
} from "@/modules/products/actions/product.actions";
import type { ProductListParams } from "@/modules/products/types/product.types";
import type { ProductInput, ProductUpdateInput } from "@/modules/products/schemas/product.schema";

const PRODUCTS_KEY = "products";

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn: () => listProductsAction(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductInput) => createProductAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductUpdateInput) => updateProductAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useFindProductByBarcode() {
  return useMutation({
    mutationFn: (barcode: string) => findProductByBarcodeAction(barcode),
  });
}
