export interface AiMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiCompletionResult {
  content: string;
  tokensUsed?: number;
}

export interface AiCompletionOptions {
  systemPrompt: string;
  messages: AiMessageInput[];
  maxTokens?: number;
}
