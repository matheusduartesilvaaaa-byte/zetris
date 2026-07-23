import { NextRequest, NextResponse } from "next/server";
import { requireActiveCompany } from "@/lib/session-guard";
import { featureFlagService } from "@/lib/feature-flags/feature-flag.service";
import { Feature } from "@/lib/feature-flags/features";
import { analyticsEngineService } from "@/modules/analytics-engine/services/analytics-engine.service";

const VALID_TYPES = ["revenue", "top-products", "top-customers", "abc-curve", "cashflow"] as const;
type BiType = (typeof VALID_TYPES)[number];

/**
 * Endpoint versionado (`/api/v1/bi/...`) para consumo por ferramentas de BI
 * externas (Power BI, Looker Studio) via conector "Web"/JSON. Autenticado
 * pela sessão do usuário (cookie) — para consumo por ferramenta externa
 * de verdade, evoluir para autenticação por API key de longa duração.
 */
export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  const type = params.type as BiType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo de exportação inválido" }, { status: 400 });
  }

  let companyId: string;
  try {
    const session = await requireActiveCompany();
    companyId = session.companyId;
  } catch {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    await featureFlagService.requireFeature(companyId, Feature.BI_EXPORT);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Acesso negado" }, { status: 403 });
  }

  const data = await fetchBiData(companyId, type);
  return NextResponse.json({ type, generatedAt: new Date().toISOString(), data });
}

async function fetchBiData(companyId: string, type: BiType) {
  switch (type) {
    case "revenue":
      return analyticsEngineService.getPeriodComparison(companyId, "month");
    case "top-products":
      return analyticsEngineService.getTopProducts(companyId, 20);
    case "top-customers":
      return analyticsEngineService.getTopCustomers(companyId, 20);
    case "abc-curve":
      return analyticsEngineService.getAbcCurve(companyId);
    case "cashflow":
      return analyticsEngineService.getCashFlowSummary(companyId);
  }
}
