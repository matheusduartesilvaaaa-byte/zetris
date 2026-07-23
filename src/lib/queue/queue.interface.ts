export type JobHandler<T = unknown> = (payload: T) => Promise<void>;

export interface IJobQueue {
  enqueue<T>(jobName: string, payload: T): Promise<void>;
  process<T>(jobName: string, handler: JobHandler<T>): void;
}
