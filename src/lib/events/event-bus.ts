import { EventEmitter } from "events";
import { logger } from "@/lib/logger";
import type { BaseEventPayload, DomainEventName } from "@/lib/events/domain-events";

/**
 * Event Bus in-process.
 *
 * IMPORTANTE — limitação conhecida e intencional deste Sprint 0:
 * como roda em memória, eventos não sobrevivem a um restart do processo e
 * não são compartilhados entre múltiplas instâncias do servidor. Isso é
 * aceitável agora porque os únicos consumidores são síncronos e rápidos
 * (auditoria). No Sprint 4 (Jobs assíncronos), este mesmo `emit()` passa a
 * publicar em uma fila real (BullMQ/Redis) SEM que os módulos que chamam
 * `eventBus.emit(...)` precisem mudar uma linha — a interface é a mesma.
 */
class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    // Muitos listeners podem se inscrever no mesmo evento (auditoria, futuros
    // e-mails, IA, webhooks) sem gerar warning de "memory leak" do Node.
    this.emitter.setMaxListeners(50);
  }

  emit<T extends BaseEventPayload>(event: DomainEventName, payload: T): void {
    logger.debug({ event, companyId: payload.companyId }, "Evento de domínio emitido");

    // Listeners rodam de forma assíncrona e isolada: um erro em um listener
    // (ex: falha ao gravar auditoria) nunca deve derrubar o fluxo principal
    // (ex: a venda já foi commitada no banco antes do evento ser emitido).
    setImmediate(() => {
      this.emitter.emit(event, payload);
    });
  }

  on<T extends BaseEventPayload>(event: DomainEventName, handler: (payload: T) => void | Promise<void>) {
    this.emitter.on(event, async (payload: T) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error({ err: error, event }, "Erro ao processar listener de evento");
      }
    });
  }
}

const globalForEventBus = globalThis as unknown as { eventBus: EventBus | undefined };

export const eventBus = globalForEventBus.eventBus ?? new EventBus();

if (process.env.NODE_ENV !== "production") globalForEventBus.eventBus = eventBus;
