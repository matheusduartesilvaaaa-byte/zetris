import type { CustomerInput } from "@/modules/customers/schemas/customer.schema";
import type { CustomerListParams } from "@/modules/customers/types/customer.types";
import type { ICustomerRepository } from "@/modules/customers/repository/customer.repository.interface";
import { customerRepository } from "@/modules/customers/repository/customer.repository";
import { eventBus } from "@/lib/events/event-bus";
import { DomainEvent, type CustomerEventPayload } from "@/lib/events/domain-events";

/**
 * Factory do service — recebe a porta (`ICustomerRepository`) em vez de
 * importar o Prisma diretamente. Isso é o que permite, em testes, chamar
 * `createCustomerService(fakeRepositoryEmMemoria)` sem precisar de banco.
 *
 * Este é o padrão de referência para os próximos módulos (Produtos,
 * Vendas, Financeiro) migrarem também.
 */
export function createCustomerService(repository: ICustomerRepository) {
  return {
    list(companyId: string, params: CustomerListParams) {
      return repository.list(companyId, params);
    },

    getById(companyId: string, id: string) {
      return repository.findById(companyId, id);
    },

    async create(companyId: string, data: CustomerInput, userId?: string) {
      const customer = await repository.create(companyId, data);

      eventBus.emit<CustomerEventPayload>(DomainEvent.CUSTOMER_CREATED, {
        companyId,
        userId,
        entityType: "Customer",
        entityId: customer.id,
      });

      return customer;
    },

    async update(companyId: string, id: string, data: CustomerInput, userId?: string) {
      const existing = await repository.findById(companyId, id);
      if (!existing) throw new Error("Cliente não encontrado.");

      await repository.update(companyId, id, data);

      eventBus.emit<CustomerEventPayload>(DomainEvent.CUSTOMER_UPDATED, {
        companyId,
        userId,
        entityType: "Customer",
        entityId: id,
      });

      return repository.findById(companyId, id);
    },

    async delete(companyId: string, id: string, userId?: string) {
      const existing = await repository.findById(companyId, id);
      if (!existing) throw new Error("Cliente não encontrado.");

      await repository.delete(companyId, id);

      eventBus.emit<CustomerEventPayload>(DomainEvent.CUSTOMER_DELETED, {
        companyId,
        userId,
        entityType: "Customer",
        entityId: id,
      });

      return { success: true };
    },
  };
}

/** Instância padrão usada pela aplicação, já conectada ao adaptador Prisma. */
export const customerService = createCustomerService(customerRepository);
