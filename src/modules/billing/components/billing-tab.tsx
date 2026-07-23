import { CurrentPlanCard } from "@/modules/billing/components/current-plan-card";
import { InvoicesTable } from "@/modules/billing/components/invoices-table";

export function BillingTab() {
  return (
    <div className="space-y-6">
      <CurrentPlanCard />
      <InvoicesTable />
    </div>
  );
}
