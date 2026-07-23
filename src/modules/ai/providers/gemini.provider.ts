import type { IAiProvider } from "@/modules/ai/providers/ai-provider.interface";
import type { AiCompletionOptions, AiCompletionResult } from "@/modules/ai/types/ai.types";

export class GeminiProvider implements IAiProvider {
  async complete({ systemPrompt, messages }: AiCompletionOptions): Promise<AiCompletionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: conversationText }] }],
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini API retornou ${response.status}: ${body}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const tokensUsed = data.usageMetadata?.totalTokenCount ?? 0;

    return { content, tokensUsed };
  }
}
