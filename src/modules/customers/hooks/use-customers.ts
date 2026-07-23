"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCustomersAction,
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from "@/modules/customers/actions/customer.actions";
import type { CustomerListParams } from "@/modules/customers/types/customer.types";
import type { CustomerInput, CustomerUpdateInput } from "@/modules/customers/schemas/customer.schema";

const CUSTOMERS_KEY = "customers";

export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, params],
    queryFn: () => listCustomersAction(params),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerInput) => createCustomerAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerUpdateInput) => updateCustomerAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomerAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}
