import type { IAiProvider } from "@/modules/ai/providers/ai-provider.interface";
import type { AiCompletionOptions, AiCompletionResult } from "@/modules/ai/types/ai.types";

export class AnthropicProvider implements IAiProvider {
  async complete({ systemPrompt, messages, maxTokens = 1000 }: AiCompletionOptions): Promise<AiCompletionResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role === "system" ? "user" : m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Anthropic API retornou ${response.status}: ${body}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "";
    const tokensUsed = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

    return { content, tokensUsed };
  }
}
