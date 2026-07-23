/**
 * Catálogo de features controladas por plano.
 *
 * Cada chave aqui corresponde a uma entrada no campo `Plan.features` (JSON)
 * no banco. Adicionar uma feature nova é: (1) adicionar a chave aqui,
 * (2) decidir em quais planos ela vem `true` por padrão no seed,
 * (3) usar `hasFeature()` para checar antes de renderizar/liberar algo.
 *
 * Nenhum módulo de negócio deve checar `plan.key === "pro"` diretamente —
 * isso acopla o código ao nome do plano. Sempre checar pela feature.
 */
export const Feature = {
  ANALYTICS_BASIC: "analytics.basic",
  ANALYTICS_DRILL_DOWN: "analytics.drill_down",
  ANALYTICS_CUSTOM_DASHBOARDS: "analytics.custom_dashboards",
  REPORTS_SCHEDULED: "reports.scheduled",
  ZIA_ASSISTANT: "zia.assistant",
  ZIA_PREDICTIONS: "zia.predictions",
  FORECAST_BASIC: "forecast.basic",
  BI_EXPORT: "bi.export",
  MULTI_BRANCH: "company.multi_branch",
} as const;

export type FeatureKey = (typeof Feature)[keyof typeof Feature];

export const PlanTier = {
  CORE: "core",
  PRO: "pro",
  BUSINESS: "business",
  ENTERPRISE: "enterprise",
} as const;

export type PlanTierKey = (typeof PlanTier)[keyof typeof PlanTier];

/**
 * Features padrão de cada plano no momento em que ele é criado no seed.
 * Isso é só o valor inicial — o campo `features` no banco pode ser editado
 * por empresa/plano sem precisar de deploy.
 */
export const DEFAULT_PLAN_FEATURES: Record<PlanTierKey, Partial<Record<FeatureKey, boolean>>> = {
  core: {
    [Feature.ANALYTICS_BASIC]: true,
    [Feature.ZIA_ASSISTANT]: true,
  },
  pro: {
    [Feature.ANALYTICS_BASIC]: true,
    [Feature.ANALYTICS_DRILL_DOWN]: true,
    [Feature.REPORTS_SCHEDULED]: true,
    [Feature.ZIA_ASSISTANT]: true,
    [Feature.FORECAST_BASIC]: true,
  },
  business: {
    [Feature.ANALYTICS_BASIC]: true,
    [Feature.ANALYTICS_DRILL_DOWN]: true,
    [Feature.ANALYTICS_CUSTOM_DASHBOARDS]: true,
    [Feature.REPORTS_SCHEDULED]: true,
    [Feature.ZIA_ASSISTANT]: true,
    [Feature.ZIA_PREDICTIONS]: true,
    [Feature.FORECAST_BASIC]: true,
    [Feature.BI_EXPORT]: true,
    [Feature.MULTI_BRANCH]: true,
  },
  enterprise: {
    [Feature.ANALYTICS_BASIC]: true,
    [Feature.ANALYTICS_DRILL_DOWN]: true,
    [Feature.ANALYTICS_CUSTOM_DASHBOARDS]: true,
    [Feature.REPORTS_SCHEDULED]: true,
    [Feature.ZIA_ASSISTANT]: true,
    [Feature.ZIA_PREDICTIONS]: true,
    [Feature.FORECAST_BASIC]: true,
    [Feature.BI_EXPORT]: true,
    [Feature.MULTI_BRANCH]: true,
  },
};
