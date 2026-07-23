export interface TimeSeriesPoint {
  date: Date;
  value: number;
}

export interface IForecastModel {
  readonly name: string;
  predict(series: TimeSeriesPoint[], horizonDays: number): Promise<TimeSeriesPoint[]>;
}
