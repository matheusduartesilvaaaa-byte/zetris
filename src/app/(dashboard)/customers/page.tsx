import { CustomersTable } from "@/modules/customers/components/customers-table";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-muted-foreground">Gerencie os clientes da sua empresa</p>
      </div>
      <CustomersTable />
    </div>
  );
}
