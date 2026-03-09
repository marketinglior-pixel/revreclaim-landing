import { ScanReport, LEAK_TYPE_LABELS } from "./types";
import { formatCurrency } from "./utils";

/**
 * Export a scan report as a structured JSON file download.
 * Designed for developers who want to integrate with their own tooling.
 */
export function exportReportJSON(report: ScanReport, options?: { privacyMode?: boolean }): void {
  const exportData = {
    meta: {
      generator: "RevReclaim",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      platform: report.platform || "stripe",
    },
    report: {
      id: report.id,
      scannedAt: report.scannedAt,
      summary: {
        healthScore: report.summary.healthScore,
        leaksFound: report.summary.leaksFound,
        mrrAtRisk: report.summary.mrrAtRisk,
        mrrAtRiskFormatted: formatCurrency(report.summary.mrrAtRisk),
        recoveryPotential: report.summary.recoveryPotential,
        recoveryPotentialFormatted: formatCurrency(report.summary.recoveryPotential),
        totalSubscriptions: report.summary.totalSubscriptions,
        totalCustomers: report.summary.totalCustomers,
        totalMRR: report.summary.totalMRR,
        totalMRRFormatted: formatCurrency(report.summary.totalMRR),
      },
      categories: report.categories.map((cat) => ({
        type: cat.type,
        label: LEAK_TYPE_LABELS[cat.type] || cat.type,
        count: cat.count,
        totalMonthlyImpact: cat.totalMonthlyImpact,
        totalMonthlyImpactFormatted: formatCurrency(cat.totalMonthlyImpact),
        percentage: cat.percentage,
      })),
      leaks: report.leaks.map((leak) => ({
        id: leak.id,
        type: leak.type,
        typeLabel: LEAK_TYPE_LABELS[leak.type] || leak.type,
        severity: leak.severity,
        title: leak.title,
        description: leak.description,
        customerId: options?.privacyMode ? `anon_${leak.id.slice(0, 8)}` : leak.customerId,
        customerEmail: options?.privacyMode ? null : leak.customerEmail,
        subscriptionId: options?.privacyMode ? null : leak.subscriptionId,
        monthlyImpact: leak.monthlyImpact,
        monthlyImpactFormatted: formatCurrency(leak.monthlyImpact),
        annualImpact: leak.annualImpact,
        annualImpactFormatted: formatCurrency(leak.annualImpact),
        fixSuggestion: leak.fixSuggestion,
        platformUrl: leak.platformUrl || leak.stripeUrl || null,
        detectedAt: leak.detectedAt,
        metadata: leak.metadata,
      })),
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date(report.scannedAt).toISOString().split("T")[0];
  link.href = url;
  link.download = `revreclaim-report-${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
