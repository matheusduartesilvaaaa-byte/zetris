import type { Customer } from "@prisma/client";
import type { CustomerInput } from "@/modules/customers/schemas/customer.schema";
import type { CustomerListParams, CustomerListResult } from "@/modules/customers/types/customer.types";

/**
 * Porta (interface) do repositório de Clientes.
 *
 * O `customerService` depende apenas disso — nunca do Prisma diretamente.
 * Isso permite:
 *   1. Trocar a implementação (ex: adicionar cache, read-replica) sem
 *      tocar no service;
 *   2. Testar o service com um repositório falso em memória, sem banco;
 *   3. Servir de modelo para os próximos módulos migrarem para o mesmo
 *      padrão (Produtos, Vendas, Financeiro, etc.).
 */
export interface ICustomerRepository {
  list(companyId: string, params: CustomerListParams): Promise<CustomerListResult>;
  findById(companyId: string, id: string): Promise<Customer | null>;
  create(companyId: string, data: CustomerInput): Promise<Customer>;
  update(companyId: string, id: string, data: CustomerInput): Promise<unknown>;
  delete(companyId: string, id: string): Promise<unknown>;
}
