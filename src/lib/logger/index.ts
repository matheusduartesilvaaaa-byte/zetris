import pino from "pino";

/**
 * Logger central da Zetris. Uso:
 *   logger.info({ companyId, saleId }, "Venda concluída");
 *   logger.error({ err }, "Falha ao processar webhook");
 *
 * IMPORTANTE: não usamos o transporte `pino-pretty` aqui de propósito.
 * O `pino-pretty` roda em uma worker thread separada, e o bundler do
 * Next.js (webpack) não consegue resolver esse arquivo de worker de forma
 * confiável — principalmente no Windows — o que derruba o processo do
 * servidor com "Cannot find module '...worker.js'". Preferimos logs em
 * JSON simples (sempre funcionam) a logs bonitos que derrubam o servidor.
 *
 * Se quiser logs coloridos legíveis em dev, rode o servidor "canalizando"
 * a saída por fora do Next.js, ex: `next dev | pino-pretty`.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "development" ? "debug" : "info"),
  base: { service: "zetris-core" },
});

/**
 * Cria um logger filho com contexto fixo (ex: companyId), evitando repetir
 * os mesmos campos em toda chamada de log dentro de um mesmo fluxo.
 */
export function createScopedLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
