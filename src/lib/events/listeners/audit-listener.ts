import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { DomainEvent, type BaseEventPayload } from "@/lib/events/domain-events";
import { eventBus } from "@/lib/events/event-bus";

/**
 * Escreve automaticamente na tabela `Log` (auditoria) sempre que um evento
 * de domínio relevante acontece. Isso substitui a necessidade de cada
 * Server Action chamar manualmente "grava um log aqui" — o módulo de
 * Vendas, por exemplo, não sabe (nem precisa saber) que está sendo
 * auditado.
 */
async function writeAuditLog(action: string, payload: BaseEventPayload) {
  await prisma.log.create({
    data: {
      companyId: payload.companyId,
      userId: payload.userId ?? null,
      action,
      entity: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
      metadata: payload.metadata ? JSON.parse(JSON.stringify(payload.metadata)) : undefined,
    },
  });
}

export function registerAuditListener() {
  const auditedEvents = Object.values(DomainEvent);

  for (const event of auditedEvents) {
    eventBus.on(event, async (payload: BaseEventPayload) => {
      await writeAuditLog(event, payload);
      logger.info({ event, companyId: payload.companyId }, "Auditoria registrada");
    });
  }
}
