import type { IAiProvider } from "@/modules/ai/providers/ai-provider.interface";
import type { AiCompletionOptions, AiCompletionResult } from "@/modules/ai/types/ai.types";

/**
 * Adaptador para modelos rodando localmente (ex: Ollama, vLLM).
 *
 * Implementação real de propósito adiada: rodar um LLM local exige um
 * servidor de inferência próprio (GPU/infra dedicada), que este projeto
 * ainda não provisiona. A porta (`IAiProvider`) já está pronta — quando
 * houver um endpoint de inferência local, basta implementar `complete()`
 * fazendo o fetch para ele; nada no resto do sistema muda.
 */
export class LocalProvider implements IAiProvider {
  async complete(_options: AiCompletionOptions): Promise<AiCompletionResult> {
    throw new Error(
      "Provedor local ainda não configurado. Defina LOCAL_LLM_ENDPOINT e implemente a chamada em LocalProvider.complete()."
    );
  }
}
