import * as revenueCalc from "@/modules/analytics-engine/calculators/revenue.calculator";
import * as profitCalc from "@/modules/analytics-engine/calculators/profit.calculator";
import * as productsCalc from "@/modules/analytics-engine/calculators/products.calculator";
import * as customersCalc from "@/modules/analytics-engine/calculators/customers.calculator";
import * as cashflowCalc from "@/modules/analytics-engine/calculators/cashflow.calculator";
import * as subscriptionCalc from "@/modules/analytics-engine/calculators/subscription-metrics.calculator";

/**
 * Analytics Engine: ponto único de acesso a todas as métricas calculadas.
 * Dashboard, ZIA, Relatórios e BI Export consomem daqui — nenhum desses
 * módulos deve calcular métrica por conta própria, para não duplicar
 * lógica de negócio (ex: dois lugares calculando "ticket médio" de jeitos
 * diferentes).
 */
export const analyticsEngineService = {
  // Receita
  getRevenue: revenueCalc.calculateRevenue,
  getPeriodComparison: revenueCalc.calculatePeriodComparison,

  // Lucro e margem
  getGrossProfit: profitCalc.calculateGrossProfit,
  getNetProfit: profitCalc.calculateNetProfit,
  getMargin: profitCalc.calculateMargin,

  // Produtos
  getTopProducts: productsCalc.calculateTopProducts,
  getBottomProducts: productsCalc.calculateBottomProducts,
  getDeadStock: productsCalc.calculateDeadStock,
  getOutOfStock: productsCalc.calculateOutOfStock,
  getAbcCurve: productsCalc.calculateAbcCurve,

  // Clientes
  getTicketMedio: customersCalc.calculateTicketMedio,
  getActiveInactiveCustomers: customersCalc.calculateActiveInactiveCustomers,
  getTopCustomers: customersCalc.calculateTopCustomers,

  // Fluxo de caixa
  getCashFlowSummary: cashflowCalc.calculateCashFlowSummary,

  // Métricas de assinatura (nível plataforma)
  getMrrArr: subscriptionCalc.calculateMrrArr,
  getChurnRate: subscriptionCalc.calculateChurnRate,
  getLtvAndCac: subscriptionCalc.calculateLtvAndCac,
};
