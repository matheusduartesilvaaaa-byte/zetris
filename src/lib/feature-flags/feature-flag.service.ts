import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/feature-flags/has-feature";
import type { FeatureKey } from "@/lib/feature-flags/features";

export class FeatureNotAvailableError extends Error {
  constructor(feature: FeatureKey) {
    super(`Recurso "${feature}" não está disponível no plano atual.`);
  }
}

/**
 * Ponto único de checagem de features. Services de módulos pagos (IA,
 * Forecast, BI) devem chamar `requireFeature`, nunca checar `plan.key`
 * diretamente — isso mantém o gating desacoplado do nome do plano.
 */
export const featureFlagService = {
  hasFeature,

  async requireFeature(companyId: string, feature: FeatureKey): Promise<void> {
    const enabled = await hasFeature(companyId, feature);
    if (!enabled) throw new FeatureNotAvailableError(feature);
  },

  async getPlanTier(companyId: string): Promise<string | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });
    return subscription?.plan.key ?? null;
  },
};
