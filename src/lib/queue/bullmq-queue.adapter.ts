import { logger } from "@/lib/logger";
import type { IJobQueue, JobHandler } from "@/lib/queue/queue.interface";

/**
 * Adaptador BullMQ. Requer `REDIS_URL` e o pacote `bullmq` instalado
 * (já está no package.json). Cada `jobName` vira uma fila própria do
 * BullMQ, com retry automático e persistência real entre restarts —
 * o que o `InProcessQueueAdapter` não oferece.
 */
export class BullMqQueueAdapter implements IJobQueue {
  private queues = new Map<string, import("bullmq").Queue>();
  private connection: { url: string };

  constructor(redisUrl: string) {
    this.connection = { url: redisUrl };
  }

  private getQueue(jobName: string) {
    if (!this.queues.has(jobName)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Queue } = require("bullmq");
      this.queues.set(jobName, new Queue(jobName, { connection: this.connection as never }));
    }
    return this.queues.get(jobName)!;
  }

  async enqueue<T>(jobName: string, payload: T): Promise<void> {
    const queue = this.getQueue(jobName);
    await queue.add(jobName, payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
  }

  process<T>(jobName: string, handler: JobHandler<T>): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Worker } = require("bullmq");
    new Worker(
      jobName,
      async (job: { data: T }) => {
        await handler(job.data);
      },
      { connection: this.connection as never }
    );
    logger.info({ jobName }, "Worker BullMQ registrado");
  }
}
