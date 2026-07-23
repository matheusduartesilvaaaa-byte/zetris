import { prisma } from "@/lib/prisma";
import { getOrSetCache, invalidateCache } from "@/lib/cache/memory-cache";
import type { FeatureKey } from "@/lib/feature-flags/features";

const CACHE_TTL_MS = 30_000;

async function getCompanyFeatures(companyId: string): Promise<Record<string, boolean>> {
  return getOrSetCache(`features:${companyId}`, CACHE_TTL_MS, async () => {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    // Assinatura cancelada/inadimplente perde acesso a todas as features pagas.
    const isEntitled = subscription && ["TRIALING", "ACTIVE"].includes(subscription.status);
    return isEntitled ? ((subscription!.plan.features as Record<string, boolean>) ?? {}) : {};
  });
}

export async function hasFeature(companyId: string, feature: FeatureKey): Promise<boolean> {
  const features = await getCompanyFeatures(companyId);
  return features[feature] === true;
}

/** Invalida o cache de uma empresa — chamar após qualquer mudança de plano. */
export async function invalidateFeatureCache(companyId: string) {
  await invalidateCache(`features:${companyId}`);
}
