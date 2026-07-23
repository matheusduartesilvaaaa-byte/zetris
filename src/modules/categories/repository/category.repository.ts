import { prisma } from "@/lib/prisma";
import type { CategoryInput } from "@/modules/categories/schemas/category.schema";

export const categoryRepository = {
  list(companyId: string) {
    return prisma.category.findMany({ where: { companyId }, orderBy: { name: "asc" } });
  },

  create(companyId: string, data: CategoryInput) {
    return prisma.category.create({ data: { ...data, companyId } });
  },

  delete(companyId: string, id: string) {
    return prisma.category.deleteMany({ where: { id, companyId } });
  },
};
