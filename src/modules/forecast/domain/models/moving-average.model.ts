import type { IForecastModel, TimeSeriesPoint } from "@/modules/forecast/domain/forecast-model.interface";

/** Previsão ingênua: repete a média dos últimos `windowSize` pontos para os dias futuros. */
export class MovingAverageModel implements IForecastModel {
  readonly name = "moving_average";

  constructor(private windowSize = 7) {}

  async predict(series: TimeSeriesPoint[], horizonDays: number): Promise<TimeSeriesPoint[]> {
    if (series.length === 0) return [];

    const window = series.slice(-this.windowSize);
    const average = window.reduce((sum, p) => sum + p.value, 0) / window.length;

    const lastDate = series[series.length - 1].date;
    return Array.from({ length: horizonDays }, (_, i) => ({
      date: new Date(lastDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
      value: Math.max(0, average),
    }));
  }
}
