"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSuppliersAction,
  createSupplierAction,
} from "@/modules/suppliers/actions/supplier.actions";
import type { SupplierInput } from "@/modules/suppliers/schemas/supplier.schema";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () => listSuppliersAction(),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierInput) => createSupplierAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}
