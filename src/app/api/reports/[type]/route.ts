import { NextRequest, NextResponse } from "next/server";
import { requireActiveCompany } from "@/lib/session-guard";
import { reportService, type ReportType } from "@/modules/reports/services/report.service";
import { reportToCsv } from "@/lib/export/csv";
import { reportToXlsx } from "@/lib/export/xlsx";
import { reportToPdf } from "@/lib/export/pdf";

const VALID_TYPES: ReportType[] = ["financial", "customers", "products", "inventory", "sales"];

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const type = params.type as ReportType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "csv";

  let companyId: string;
  try {
    const session = await requireActiveCompany();
    companyId = session.companyId;
  } catch {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const report = await reportService.getReportData(companyId, type);
  const filename = `zetris-${type}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buffer = await reportToXlsx(report);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await reportToPdf(report);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  // CSV (padrão)
  const csv = reportToCsv(report);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
