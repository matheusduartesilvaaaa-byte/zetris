import type { IJobQueue } from "@/lib/queue/queue.interface";
import { InProcessQueueAdapter } from "@/lib/queue/in-process-queue.adapter";

const globalForQueue = globalThis as unknown as { jobQueue: IJobQueue | undefined };

function resolveQueue(): IJobQueue {
  if (globalForQueue.jobQueue) return globalForQueue.jobQueue;

  let adapter: IJobQueue;
  if (process.env.REDIS_URL) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BullMqQueueAdapter } = require("@/lib/queue/bullmq-queue.adapter");
    adapter = new BullMqQueueAdapter(process.env.REDIS_URL);
  } else {
    adapter = new InProcessQueueAdapter();
  }

  globalForQueue.jobQueue = adapter;
  return adapter;
}

export const jobQueue = resolveQueue();

export const JobName = {
  SEND_EMAIL: "send_email",
  RUN_FORECAST: "run_forecast",
  GENERATE_AI_INSIGHT: "generate_ai_insight",
} as const;
