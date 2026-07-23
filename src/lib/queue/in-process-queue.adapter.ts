import { logger } from "@/lib/logger";
import type { IJobQueue, JobHandler } from "@/lib/queue/queue.interface";

/**
 * Adaptador in-process: enfileira usando `setImmediate` (fora da linha de
 * execução principal, mas sem uma fila persistente/distribuída). Isso é
 * real — o job roda mesmo — só não sobrevive a um restart do processo, e
 * não é compartilhado entre múltiplas instâncias do servidor.
 *
 * Para produção com múltiplas instâncias, defina `REDIS_URL` e o sistema
 * troca automaticamente para `BullMqQueueAdapter`, sem mudar quem chama
 * `queue.enqueue(...)`.
 */
export class InProcessQueueAdapter implements IJobQueue {
  private handlers = new Map<string, JobHandler>();

  async enqueue<T>(jobName: string, payload: T): Promise<void> {
    const handler = this.handlers.get(jobName);
    if (!handler) {
      logger.warn({ jobName }, "Nenhum handler registrado para este job — payload descartado");
      return;
    }

    setImmediate(async () => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error({ err: error, jobName }, "Falha ao processar job in-process");
      }
    });
  }

  process<T>(jobName: string, handler: JobHandler<T>): void {
    this.handlers.set(jobName, handler as JobHandler);
  }
}
