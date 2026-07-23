import type { IAiProvider } from "@/modules/ai/providers/ai-provider.interface";
import type { AiCompletionOptions, AiCompletionResult } from "@/modules/ai/types/ai.types";

export class OpenAiProvider implements IAiProvider {
  async complete({ systemPrompt, messages, maxTokens = 1000 }: AiCompletionOptions): Promise<AiCompletionResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_tokens: maxTokens,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API retornou ${response.status}: ${body}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const tokensUsed = data.usage?.total_tokens ?? 0;

    return { content, tokensUsed };
  }
}
