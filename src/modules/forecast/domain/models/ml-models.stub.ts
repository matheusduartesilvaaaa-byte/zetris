import type { IForecastModel, TimeSeriesPoint } from "@/modules/forecast/domain/forecast-model.interface";

/**
 * Prophet, ARIMA e LSTM exigem bibliotecas de ML (Python: `prophet`,
 * `statsmodels`, `tensorflow`/`pytorch`) que não rodam no runtime do
 * Next.js/Node. A implementação real desses modelos é: subir um
 * microserviço Python (ex: FastAPI) que expõe um endpoint de previsão, e
 * estas classes fazem uma chamada HTTP para ele.
 *
 * Isso é deixado como porta pronta, não como funcionalidade fake: cada
 * classe implementa `IForecastModel` corretamente e lança um erro claro
 * em vez de fingir uma previsão. Quando o microserviço existir, o `predict`
 * vira um `fetch()` — nenhum outro código do Forecast Engine muda.
 */
abstract class UnavailableModel implements IForecastModel {
  abstract readonly name: string;
  protected abstract readonly requiredService: string;

  async predict(_series: TimeSeriesPoint[], _horizonDays: number): Promise<TimeSeriesPoint[]> {
    throw new Error(
      `Modelo "${this.name}" requer ${this.requiredService}, ainda não provisionado. Configure FORECAST_ML_SERVICE_URL quando o microserviço estiver disponível.`
    );
  }
}

export class ProphetModel extends UnavailableModel {
  readonly name = "prophet";
  protected readonly requiredService = "um microserviço Python com a biblioteca Prophet";
}

export class ArimaModel extends UnavailableModel {
  readonly name = "arima";
  protected readonly requiredService = "um microserviço Python com statsmodels (ARIMA)";
}

export class LstmModel extends UnavailableModel {
  readonly name = "lstm";
  protected readonly requiredService = "um microserviço Python com TensorFlow/PyTorch treinado";
}
