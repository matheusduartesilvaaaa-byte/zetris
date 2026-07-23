import { dashboardService } from "@/modules/dashboard/services/dashboard.service";
import { createAiProvider } from "@/modules/ai/providers/provider-factory";
import { buildZiaSystemPrompt } from "@/modules/ai/prompts/system-prompt";
import { conversationRepository } from "@/modules/ai/memory/conversation.repository";
import { findTool, ziaTools } from "@/modules/ai/tools/tool-registry";
import { usageLimitService } from "@/modules/ai/services/usage-limit.service";
import { featureFlagService } from "@/lib/feature-flags/feature-flag.service";
import { Feature } from "@/lib/feature-flags/features";
import { eventBus } from "@/lib/events/event-bus";
import { DomainEvent, type AiConversationPayload } from "@/lib/events/domain-events";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Roteador simples de intenção → ferramenta, por palavra-chave. Isso é uma
 * ponte honesta até o function-calling nativo do provedor: já usa dados
 * reais (via `ziaTools`), só ainda não deixa o próprio modelo decidir qual
 * ferramenta chamar. Migrar para function-calling nativo não muda a
 * assinatura de `chat()`, só a forma como as tools são selecionadas.
 */
function selectRelevantTools(question: string) {
  const q = question.toLowerCase();
  const matches = ziaTools.filter((tool) => {
    if (tool.name === "get_revenue_summary") return /receita|faturamento|venda/.test(q);
    if (tool.name === "get_ticket_medio") return /ticket|médio/.test(q);
    if (tool.name === "get_customer_segmentation") return /cliente/.test(q);
    if (tool.name === "get_cash_flow_summary") return /caixa|financeiro|saldo/.test(q);
    return false;
  });
  return matches.length > 0 ? matches : ziaTools.slice(0, 1); // fallback: contexto de receita
}

export const ziaService = {
  async chat(companyId: string, userId: string, question: string) {
    await featureFlagService.requireFeature(companyId, Feature.ZIA_ASSISTANT);
    await usageLimitService.assertWithinLimit(companyId);

    const conversation = await conversationRepository.findOrCreateActive(companyId, userId);
    await conversationRepository.appendMessage(conversation.id, "USER", question);

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    const summary = await dashboardService.getSummary(companyId);

    const relevantTools = selectRelevantTools(question);
    const toolResults: Record<string, unknown> = {};
    for (const tool of relevantTools) {
      try {
        toolResults[tool.name] = await tool.run(companyId);
      } catch (error) {
        logger.error({ err: error, tool: tool.name }, "Falha ao executar ferramenta da ZIA");
      }
    }

    const systemPrompt = buildZiaSystemPrompt({
      companyName: company?.name ?? "sua empresa",
      revenueMonth: summary.revenueMonth,
      lowStockCount: summary.lowStockCount,
    });

    const history = await conversationRepository.getHistory(conversation.id);
    const messages = history.map((m) => ({
      role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    }));

    // Injeta os dados reais das ferramentas como contexto adicional
    messages.push({
      role: "user",
      content: `Dados disponíveis para responder: ${JSON.stringify(toolResults)}`,
    });

    const provider = createAiProvider();

    let answer: string;
    let tokensUsed: number | undefined;
    try {
      const result = await provider.complete({ systemPrompt, messages, maxTokens: 800 });
      answer = result.content;
      tokensUsed = result.tokensUsed;
    } catch (error) {
      // Se o provedor de IA não estiver configurado (sem API key) ou falhar,
      // caímos para uma resposta baseada nos dados reais das ferramentas —
      // nunca fingimos uma resposta de IA quando ela não rodou de verdade.
      logger.error({ err: error }, "Falha ao chamar provedor de IA — usando fallback baseado em dados");
      answer = buildFallbackAnswer(toolResults);
    }

    await conversationRepository.appendMessage(conversation.id, "ASSISTANT", answer, tokensUsed);

    eventBus.emit<AiConversationPayload>(DomainEvent.AI_CONVERSATION_CREATED, {
      companyId,
      userId,
      entityType: "AiConversation",
      entityId: conversation.id,
    });

    return { answer, conversationId: conversation.id };
  },
};

function buildFallbackAnswer(toolResults: Record<string, unknown>): string {
  const entries = Object.entries(toolResults);
  if (entries.length === 0) {
    return "No momento não consigo acessar a IA generativa (verifique a chave de API configurada), e não encontrei dados suficientes para responder diretamente.";
  }
  const [, data] = entries[0];
  return `A IA generativa não está disponível no momento (verifique ANTHROPIC_API_KEY/OPENAI_API_KEY/GEMINI_API_KEY), mas aqui estão os dados reais: ${JSON.stringify(data)}`;
}
