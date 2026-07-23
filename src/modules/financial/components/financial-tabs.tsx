"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PayableTable } from "@/modules/financial/components/payable-table";
import { ReceivableTable } from "@/modules/financial/components/receivable-table";
import { CashFlowView } from "@/modules/financial/components/cash-flow-view";

export function FinancialTabs() {
  return (
    <Tabs defaultValue="payable">
      <TabsList>
        <TabsTrigger value="payable">Contas a pagar</TabsTrigger>
        <TabsTrigger value="receivable">Contas a receber</TabsTrigger>
        <TabsTrigger value="cashflow">Fluxo de caixa</TabsTrigger>
      </TabsList>

      <TabsContent value="payable">
        <PayableTable />
      </TabsContent>
      <TabsContent value="receivable">
        <ReceivableTable />
      </TabsContent>
      <TabsContent value="cashflow">
        <CashFlowView />
      </TabsContent>
    </Tabs>
  );
}
