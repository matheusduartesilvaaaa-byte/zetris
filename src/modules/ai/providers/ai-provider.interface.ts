import type { AiCompletionOptions, AiCompletionResult } from "@/modules/ai/types/ai.types";

export interface IAiProvider {
  complete(options: AiCompletionOptions): Promise<AiCompletionResult>;
}
