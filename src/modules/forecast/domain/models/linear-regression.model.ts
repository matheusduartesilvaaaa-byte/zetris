import type { IForecastModel, TimeSeriesPoint } from "@/modules/forecast/domain/forecast-model.interface";

/** Regressão linear simples (mínimos quadrados) sobre o índice temporal. */
export class LinearRegressionModel implements IForecastModel {
  readonly name = "linear_regression";

  async predict(series: TimeSeriesPoint[], horizonDays: number): Promise<TimeSeriesPoint[]> {
    if (series.length < 2) return [];

    const n = series.length;
    const xs = series.map((_, i) => i);
    const ys = series.map((p) => p.value);

    const xMean = xs.reduce((a, b) => a + b, 0) / n;
    const yMean = ys.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xs[i] - xMean) * (ys[i] - yMean);
      denominator += (xs[i] - xMean) ** 2;
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;

    const lastDate = series[series.length - 1].date;
    return Array.from({ length: horizonDays }, (_, i) => {
      const x = n + i;
      return {
        date: new Date(lastDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        value: Math.max(0, slope * x + intercept),
      };
    });
  }
}
