"use server";

import { requireActiveCompany } from "@/lib/session-guard";
import { forecastService } from "@/modules/forecast/services/forecast.service";
import { FeatureNotAvailableError } from "@/lib/feature-flags/feature-flag.service";

export async function forecastRevenueAction(horizonDays = 30) {
  const { companyId } = await requireActiveCompany();

  try {
    return { success: true as const, data: await forecastService.forecastRevenue(companyId, horizonDays) };
  } catch (error) {
    if (error instanceof FeatureNotAvailableError) {
      return { success: false as const, message: error.message };
    }
    return { success: false as const, message: "Erro ao calcular previsão." };
  }
}
