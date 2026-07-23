import type { ReportData } from "@/modules/reports/services/report.service";

export function reportToCsv(report: ReportData): string {
  const escape = (value: string | number) => {
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    report.headers.map(escape).join(","),
    ...report.rows.map((row) => row.map(escape).join(",")),
  ];

  // BOM para o Excel abrir corretamente acentuação em UTF-8
  return "\uFEFF" + lines.join("\n");
}
