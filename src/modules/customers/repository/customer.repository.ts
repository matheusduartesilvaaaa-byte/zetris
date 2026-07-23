import { prisma } from "@/lib/prisma";
import type { CustomerInput } from "@/modules/customers/schemas/customer.schema";
import type { CustomerListParams } from "@/modules/customers/types/customer.types";
import type { ICustomerRepository } from "@/modules/customers/repository/customer.repository.interface";

/** Implementação (adaptador) Prisma da porta ICustomerRepository. */
export const customerRepository: ICustomerRepository = {
  async list(companyId: string, params: CustomerListParams) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where = {
      companyId,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" as const } },
              { document: { contains: params.search, mode: "insensitive" as const } },
              { email: { contains: params.search, mode: "insensitive" as const } },
              { phone: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  findById(companyId: string, id: string) {
    // companyId no filtro garante que um usuário nunca acesse cliente de outra empresa
    return prisma.customer.findFirst({ where: { id, companyId } });
  },

  create(companyId: string, data: CustomerInput) {
    return prisma.customer.create({ data: { ...data, companyId } });
  },

  update(companyId: string, id: string, data: CustomerInput) {
    return prisma.customer.updateMany({ where: { id, companyId }, data });
  },

  delete(companyId: string, id: string) {
    return prisma.customer.deleteMany({ where: { id, companyId } });
  },
};
