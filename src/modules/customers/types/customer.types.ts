import type { Customer } from "@prisma/client";

export type { Customer };

export interface CustomerListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerListResult {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}
