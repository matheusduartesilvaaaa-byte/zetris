import { startOfMonth } from "date-fns";
import { conversationRepository } from "@/modules/ai/memory/conversation.repository";

/**
 * Limite de mensagens/mês por plano. Valor simples hoje (fixo por enquanto);
 * evoluir para vir do campo `Plan.features` (ex: `{ "zia.monthly_limit": 500 }`)
 * quando o produto precisar de limites diferentes por plano específico.
 */
const DEFAULT_MONTHLY_LIMIT = 200;

export class AiUsageLimitExceededError extends Error {
  constructor(limit: number) {
    super(`Limite de ${limit} mensagens da ZIA neste mês foi atingido. Faça upgrade de plano para continuar.`);
  }
}

export const usageLimitService = {
  async assertWithinLimit(companyId: string) {
    const monthStart = startOfMonth(new Date());
    const count = await conversationRepository.countMessagesThisMonth(companyId, monthStart);

    if (count >= DEFAULT_MONTHLY_LIMIT) {
      throw new AiUsageLimitExceededError(DEFAULT_MONTHLY_LIMIT);
    }
  },
};
