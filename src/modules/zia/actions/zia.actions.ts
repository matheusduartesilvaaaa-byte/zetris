"use server";

import { requireActiveCompany } from "@/lib/session-guard";
import { ziaService } from "@/modules/ai/services/zia.service";
import { FeatureNotAvailableError } from "@/lib/feature-flags/feature-flag.service";
import { AiUsageLimitExceededError } from "@/modules/ai/services/usage-limit.service";

export interface ZiaResponse {
  answer: string;
}

export async function askZiaAction(question: string): Promise<ZiaResponse> {
  const { companyId, userId } = await requireActiveCompany();

  try {
    const result = await ziaService.chat(companyId, userId, question);
    return { answer: result.answer };
  } catch (error) {
    if (error instanceof FeatureNotAvailableError) {
      return { answer: "A ZIA não está disponível no seu plano atual." };
    }
    if (error instanceof AiUsageLimitExceededError) {
      return { answer: error.message };
    }
    return { answer: "Não consegui responder agora. Tente novamente em instantes." };
  }
}
