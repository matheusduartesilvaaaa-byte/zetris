import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ReportData } from "@/modules/reports/services/report.service";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 4, color: "#2563eb", fontWeight: 700 },
  subtitle: { fontSize: 9, marginBottom: 16, color: "#666" },
  table: { display: "flex", width: "100%" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  headerRow: { flexDirection: "row", backgroundColor: "#2563eb" },
  cell: { flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: "#e5e7eb" },
  headerCell: { flex: 1, padding: 6, color: "#ffffff", fontWeight: 700 },
});

function ReportDocument({ report }: { report: ReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.subtitle}>
          Gerado em {new Date().toLocaleString("pt-BR")} — Zetris
        </Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {report.headers.map((header, i) => (
              <Text key={i} style={styles.headerCell}>
                {header}
              </Text>
            ))}
          </View>
          {report.rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, cellIndex) => (
                <Text key={cellIndex} style={styles.cell}>
                  {String(cell)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export async function reportToPdf(report: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} />);
}
