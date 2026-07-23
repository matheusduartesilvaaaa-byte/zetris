"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSalesAction,
  createSaleAction,
  cancelSaleAction,
} from "@/modules/sales/actions/sale.actions";
import type { SaleListParams } from "@/modules/sales/types/sale.types";
import type { SaleInput } from "@/modules/sales/schemas/sale.schema";

const SALES_KEY = "sales";

export function useSales(params: SaleListParams) {
  return useQuery({
    queryKey: [SALES_KEY, params],
    queryFn: () => listSalesAction(params),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaleInput) => createSaleAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSaleAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
