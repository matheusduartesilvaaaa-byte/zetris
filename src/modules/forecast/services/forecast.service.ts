import { prisma } from "@/lib/prisma";
import { MovingAverageModel } from "@/modules/forecast/domain/models/moving-average.model";
import { LinearRegressionModel } from "@/modules/forecast/domain/models/linear-regression.model";
import type { IForecastModel, TimeSeriesPoint } from "@/modules/forecast/domain/forecast-model.interface";
import { featureFlagService } from "@/lib/feature-flags/feature-flag.service";
import { Feature } from "@/lib/feature-flags/features";
import { eventBus } from "@/lib/events/event-bus";
import { DomainEvent, type ForecastFinishedPayload } from "@/lib/events/domain-events";

async function getRevenueSeries(companyId: string, days: number): Promise<TimeSeriesPoint[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sales = await prisma.sale.findMany({
    where: { companyId, status: "COMPLETED", createdAt: { gte: since } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const sale of sales) {
    const key = sale.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(sale.total));
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date: new Date(date), value }));
}

export const forecastService = {
  /**
   * Modelo padrão: regressão linear (funciona sempre, sem infra externa).
   * Escolha de modelo mais sofisticado (Prophet/ARIMA/LSTM) fica pronta
   * para quando o microserviço de ML existir.
   */
  getModel(name: "moving_average" | "linear_regression" = "linear_regression"): IForecastModel {
    return name === "moving_average" ? new MovingAverageModel() : new LinearRegressionModel();
  },

  async forecastRevenue(companyId: string, horizonDays = 30) {
    await featureFlagService.requireFeature(companyId, Feature.FORECAST_BASIC);

    const series = await getRevenueSeries(companyId, 90);
    const model = this.getModel("linear_regression");
    const predictions = await model.predict(series, horizonDays);

    eventBus.emit<ForecastFinishedPayload>(DomainEvent.FORECAST_FINISHED, {
      companyId,
      entityType: "Forecast",
      metadata: { kind: "revenue", horizonDays },
    });

    return { model: model.name, historical: series, predictions };
  },
};
