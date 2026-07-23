"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPayableAction,
  createPayableAction,
  payPayableAction,
  deletePayableAction,
  listReceivableAction,
  createReceivableAction,
  receivePaymentAction,
  deleteReceivableAction,
  listFinancialCategoriesAction,
  createFinancialCategoryAction,
  listCashFlowAction,
} from "@/modules/financial/actions/financial.actions";
import type { AccountListParams, CashFlowListParams } from "@/modules/financial/types/financial.types";
import type { AccountInput, FinancialCategoryInput } from "@/modules/financial/schemas/account.schema";

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["payable"] });
  queryClient.invalidateQueries({ queryKey: ["receivable"] });
  queryClient.invalidateQueries({ queryKey: ["cash-flow"] });
}

// Contas a pagar
export function usePayable(params: AccountListParams) {
  return useQuery({ queryKey: ["payable", params], queryFn: () => listPayableAction(params) });
}
export function useCreatePayable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AccountInput) => createPayableAction(data),
    onSuccess: () => invalidateAll(queryClient),
  });
}
export function usePayPayable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payPayableAction(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}
export function useDeletePayable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayableAction(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}

// Contas a receber
export function useReceivable(params: AccountListParams) {
  return useQuery({ queryKey: ["receivable", params], queryFn: () => listReceivableAction(params) });
}
export function useCreateReceivable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AccountInput) => createReceivableAction(data),
    onSuccess: () => invalidateAll(queryClient),
  });
}
export function useReceivePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => receivePaymentAction(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}
export function useDeleteReceivable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReceivableAction(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}

// Categorias financeiras
export function useFinancialCategories() {
  return useQuery({ queryKey: ["financial-categories"], queryFn: () => listFinancialCategoriesAction() });
}
export function useCreateFinancialCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FinancialCategoryInput) => createFinancialCategoryAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-categories"] }),
  });
}

// Fluxo de caixa
export function useCashFlow(params: CashFlowListParams) {
  return useQuery({ queryKey: ["cash-flow", params], queryFn: () => listCashFlowAction(params) });
}
