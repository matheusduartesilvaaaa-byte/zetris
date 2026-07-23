import type { IAiProvider } from "@/modules/ai/providers/ai-provider.interface";
import { AnthropicProvider } from "@/modules/ai/providers/anthropic.provider";
import { OpenAiProvider } from "@/modules/ai/providers/openai.provider";
import { GeminiProvider } from "@/modules/ai/providers/gemini.provider";
import { LocalProvider } from "@/modules/ai/providers/local.provider";

export type AiProviderKey = "anthropic" | "openai" | "gemini" | "local";

/**
 * Seleciona o provedor de IA. Padrão: Anthropic. Pode ser sobrescrito por
 * empresa no futuro (campo `AiConversation.provider` já existe no schema)
 * ou globalmente via `AI_DEFAULT_PROVIDER`.
 */
export function createAiProvider(key?: AiProviderKey): IAiProvider {
  const resolved = key ?? (process.env.AI_DEFAULT_PROVIDER as AiProviderKey) ?? "anthropic";

  switch (resolved) {
    case "openai":
      return new OpenAiProvider();
    case "gemini":
      return new GeminiProvider();
    case "local":
      return new LocalProvider();
    case "anthropic":
    default:
      return new AnthropicProvider();
  }
}
