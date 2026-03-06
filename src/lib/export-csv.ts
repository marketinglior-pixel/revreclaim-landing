import { ScanReport, LEAK_TYPE_LABELS } from "./types";
import { formatCurrency } from "./utils";

/**
 * Export a scan report's leaks as a CSV file download.
 */
export function exportReportCSV(report: ScanReport): void {
  const headers = [
    "Type",
    "Severity",
    "Title",
    "Customer",
    "Monthly Impact",
    "Annual Impact",
    "Fix Suggestion",
  ];

  const rows = report.leaks.map((leak) => [
    escapeCsvField(LEAK_TYPE_LABELS[leak.type]),
    leak.severity.toUpperCase(),
    escapeCsvField(leak.title),
    escapeCsvField(leak.customerEmail || leak.customerId),
    formatCurrency(leak.monthlyImpact),
    formatCurrency(leak.annualImpact),
    escapeCsvField(leak.fixSuggestion),
  ]);

  // Summary row at top
  const summaryRows = [
    ["RevReclaim Revenue Leak Report"],
    [`Scanned: ${new Date(report.scannedAt).toLocaleString()}`],
    [`Health Score: ${report.summary.healthScore}/100`],
    [`MRR at Risk: ${formatCurrency(report.summary.mrrAtRisk)}`],
    [`Leaks Found: ${report.summary.leaksFound}`],
    [`Annual Recovery Potential: ${formatCurrency(report.summary.recoveryPotential)}`],
    [], // empty row separator
  ];

  const csvContent = [
    ...summaryRows.map((row) => row.join(",")),
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date(report.scannedAt).toISOString().split("T")[0];
  link.href = url;
  link.download = `revreclaim-report-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
