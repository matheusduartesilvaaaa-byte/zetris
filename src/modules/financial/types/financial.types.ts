import type { AccountPayable, AccountReceivable, CashFlowEntry, FinancialCategory } from "@prisma/client";

export type { AccountPayable, AccountReceivable, CashFlowEntry, FinancialCategory };

export interface AccountListParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CashFlowListParams {
  type?: string;
  page?: number;
  pageSize?: number;
}
