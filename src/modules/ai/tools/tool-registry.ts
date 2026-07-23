import { dashboardService } from "@/modules/dashboard/services/dashboard.service";
import { analyticsEngineService } from "@/modules/analytics-engine/services/analytics-engine.service";

export interface AiTool {
  name: string;
  description: string;
  run: (companyId: string) => Promise<Record<string, unknown>>;
}

/**
 * Ferramentas que a ZIA pode consultar. Hoje são chamadas por um roteador
 * simples baseado em palavras-chave (ver `zia.service.ts`) — o próximo
 * passo natural é conectar isso ao function-calling nativo de cada
 * provedor (Anthropic `tool_use`, OpenAI `tools`), passando este mesmo
 * catálogo. A estrutura já está pronta para isso: cada tool é uma função
 * pura que devolve dados reais, sem depender de como o LLM a invoca.
 */
export const ziaTools: AiTool[] = [
  {
    name: "get_revenue_summary",
    description: "Receita do mês, do dia e número de vendas da empresa",
    run: (companyId) => dashboardService.getSummary(companyId),
  },
  {
    name: "get_ticket_medio",
    description: "Ticket médio das vendas concluídas",
    run: (companyId) => analyticsEngineService.getTicketMedio(companyId),
  },
  {
    name: "get_customer_segmentation",
    description: "Clientes ativos e inativos nos últimos 90 dias",
    run: (companyId) => analyticsEngineService.getActiveInactiveCustomers(companyId),
  },
  {
    name: "get_cash_flow_summary",
    description: "Saldo, entradas e saídas do fluxo de caixa",
    run: (companyId) => analyticsEngineService.getCashFlowSummary(companyId),
  },
];

export function findTool(name: string): AiTool | undefined {
  return ziaTools.find((tool) => tool.name === name);
}
