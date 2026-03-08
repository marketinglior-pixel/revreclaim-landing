import type { ScanReport } from "@/lib/types";

export interface TrendPoint {
  date: string; // ISO string
  label: string; // formatted label for display (e.g., "Mar 8")
  mrrAtRisk: number; // in cents
  leaksFound: number;
  healthScore: number;
  recoveryPotential: number; // in cents (annual)
}

/**
 * Extract trend data from an array of historical scan reports.
 * Reports should be ordered newest-first (as they come from the DB).
 * Returns points ordered oldest-first (chronological) for chart rendering.
 */
export function extractTrends(reports: ScanReport[]): TrendPoint[] {
  // Reverse to chronological order (oldest first)
  const chronological = [...reports].reverse();

  return chronological.map((report) => {
    const date = new Date(report.scannedAt);
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      date: report.scannedAt,
      label,
      mrrAtRisk: report.summary.mrrAtRisk,
      leaksFound: report.summary.leaksFound,
      healthScore: report.summary.healthScore,
      recoveryPotential: report.summary.recoveryPotential,
    };
  });
}

/**
 * Calculate the change between the last two data points.
 * Returns { value, direction, percentage }.
 */
export function calculateChange(
  points: TrendPoint[],
  metric: keyof Pick<TrendPoint, "mrrAtRisk" | "leaksFound" | "healthScore">
): { value: number; direction: "up" | "down" | "flat"; percentage: number } {
  if (points.length < 2) {
    return { value: 0, direction: "flat", percentage: 0 };
  }

  const current = points[points.length - 1][metric];
  const previous = points[points.length - 2][metric];
  const diff = current - previous;
  const percentage = previous === 0 ? 0 : Math.round((diff / previous) * 100);

  return {
    value: Math.abs(diff),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
    percentage: Math.abs(percentage),
  };
}
