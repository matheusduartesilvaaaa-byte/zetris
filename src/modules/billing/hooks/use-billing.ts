"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getCurrentSubscriptionAction,
  listPlansAction,
  createCheckoutSessionAction,
  createBillingPortalSessionAction,
} from "@/modules/billing/actions/billing.actions";

export function useSubscription() {
  return useQuery({ queryKey: ["subscription"], queryFn: () => getCurrentSubscriptionAction() });
}

export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: () => listPlansAction() });
}

export function useCheckout() {
  return useMutation({
    mutationFn: (planKey: string) => createCheckoutSessionAction(planKey),
  });
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: () => createBillingPortalSessionAction(),
  });
}
