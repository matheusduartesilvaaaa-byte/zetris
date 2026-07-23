"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCategoriesAction,
  createCategoryAction,
} from "@/modules/categories/actions/category.actions";
import type { CategoryInput } from "@/modules/categories/schemas/category.schema";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategoriesAction(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => createCategoryAction(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
