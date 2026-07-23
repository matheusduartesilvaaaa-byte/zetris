"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listStockMovementsAction,
  createStockMovementAction,
} from "@/modules/inventory/actions/inventory.actions";
import type { StockMovementListParams } from "@/modules/inventory/types/inventory.types";
import type { StockMovementInput } from "@/modules/inventory/schemas/stock-movement.schema";

const MOVEMENTS_KEY = "stock-movements";

export function useStockMovements(params: StockMovementListParams) {
  return useQuery({
    queryKey: [MOVEMENTS_KEY, params],
    queryFn: () => listStockMovementsAction(params),
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockMovementInput) => createStockMovementAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MOVEMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
