import { prisma } from "@/lib/prisma";
import type { SupplierInput } from "@/modules/suppliers/schemas/supplier.schema";

export const supplierRepository = {
  list(companyId: string) {
    return prisma.supplier.findMany({ where: { companyId }, orderBy: { name: "asc" } });
  },

  create(companyId: string, data: SupplierInput) {
    return prisma.supplier.create({ data: { ...data, companyId } });
  },

  delete(companyId: string, id: string) {
    return prisma.supplier.deleteMany({ where: { id, companyId } });
  },
};
