"use client";

import { Leak, ScanSummary } from "@/lib/types";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import { isActionableLeak } from "@/lib/leak-categories";
import { formatCurrency } from "@/lib/utils";
import HealthScore from "./HealthScore";

interface ReportSummaryProps {
  summary: ScanSummary;
  leaks?: Leak[];
}

/**
 * Get MRR-at-risk benchmark color + label.
 * Industry average: 3-5% of MRR is at risk from billing issues.
 */
function getBenchmark(pct: number): { color: string; label: string; bgColor: string } {
  if (pct < 2) return { color: "#10B981", label: "Excellent", bgColor: "bg-emerald-500/10" };
  if (pct < 5) return { color: "#F59E0B", label: "Average", bgColor: "bg-amber-500/10" };
  if (pct < 8) return { color: "#F97316", label: "Above Average", bgColor: "bg-orange-500/10" };
  return { color: "#EF4444", label: "High Risk", bgColor: "bg-red-500/10" };
}

export default function ReportSummary({ summary, leaks }: ReportSummaryProps) {
  // Compute split metrics if leaks are provided
  const actionableLeaks = leaks?.filter((l) => isActionableLeak(l.type)) ?? [];
  const reviewLeaks = leaks?.filter((l) => !isActionableLeak(l.type)) ?? [];
  const mrrActionable = actionableLeaks.reduce(
    (sum, l) => sum + Math.round(l.monthlyImpact * (l.recoveryRate ?? 1)),
    0
  );
  const mrrReview = reviewLeaks.reduce(
    (sum, l) => sum + Math.round(l.monthlyImpact * (l.recoveryRate ?? 1)),
    0
  );
  const hasReviewLeaks = leaks && reviewLeaks.length > 0;

  // % of MRR at risk (weighted)
  const mrrAtRiskPct = summary.totalMRR > 0
    ? Math.min((summary.mrrAtRisk / summary.totalMRR) * 100, 100)
    : 0;
  const benchmark = getBenchmark(mrrAtRiskPct);

  return (
    <div className="space-y-4">
      {/* MRR at Risk Benchmark Bar */}
      {summary.totalMRR > 0 && summary.mrrAtRisk > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {mrrAtRiskPct.toFixed(1)}% of your MRR is at risk
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${benchmark.bgColor}`}
                style={{ color: benchmark.color }}
              >
                {benchmark.label}
              </span>
            </div>
            <span className="text-xs text-text-dim">Industry avg: 3-5%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(mrrAtRiskPct * 10, 100)}%`, // Scale: 10% risk = full bar
                backgroundColor: benchmark.color,
              }}
            />
          </div>
          <p className="text-[10px] text-text-dim mt-1.5">
            Based on weighted recovery rates for each leak type
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Health Score - spans 1 col */}
        <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-center lg:col-span-1 animate-fade-in-up">
          <HealthScore score={summary.healthScore} />
        </div>

        {/* Stats grid - spans 4 cols */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedStatCard
            label={hasReviewLeaks ? "Actionable MRR at Risk" : "MRR at Risk"}
            cents={hasReviewLeaks ? mrrActionable : summary.mrrAtRisk}
            suffix="/mo"
            color="#EF4444"
            description={
              hasReviewLeaks
                ? `${actionableLeaks.length} leak${actionableLeaks.length !== 1 ? "s" : ""} needing action`
                : `${mrrAtRiskPct.toFixed(1)}% of your MRR`
            }
            footnote={
              hasReviewLeaks && mrrReview > 0
                ? `Plus ${formatCurrency(mrrReview)}/mo in ${reviewLeaks.length} item${reviewLeaks.length !== 1 ? "s" : ""} to review`
                : undefined
            }
            delay={100}
            glow={summary.mrrAtRisk > 0}
          />
          <AnimatedStatCard
            label="Leaks Found"
            rawValue={hasReviewLeaks ? actionableLeaks.length : summary.leaksFound}
            color={summary.leaksFound > 0 ? "#F59E0B" : "#10B981"}
            description={
              hasReviewLeaks
                ? `+ ${reviewLeaks.length} for review`
                : `Across ${summary.totalSubscriptions} subscriptions`
            }
            delay={200}
          />
          <AnimatedStatCard
            label="MRR Recoverable"
            cents={summary.mrrAtRisk}
            suffix="/mo"
            color="#10B981"
            description="Weighted by recovery likelihood"
            delay={300}
          />
          <AnimatedStatCard
            label="Total MRR"
            cents={summary.totalMRR}
            suffix="/mo"
            color="#3B82F6"
            description={`${summary.totalCustomers} customers`}
            footnote={
              summary.trialingMRR > 0
                ? `+ ${formatCurrency(summary.trialingMRR)}/mo in trials`
                : undefined
            }
            delay={400}
          />
        </div>
      </div>
    </div>
  );
}

function AnimatedStatCard({
  label,
  cents,
  rawValue,
  suffix,
  color,
  description,
  footnote,
  delay,
  glow,
}: {
  label: string;
  cents?: number;
  rawValue?: number;
  suffix?: string;
  color: string;
  description: string;
  footnote?: string;
  delay: number;
  glow?: boolean;
}) {
  // Animate dollars (from cents) or raw number
  const target = cents !== undefined ? Math.round(cents / 100) : (rawValue ?? 0);
  const animated = useAnimatedNumber(target, 1200, delay);
  const isCurrency = cents !== undefined;

  const glowClass =
    glow && color === "#EF4444"
      ? "glow-red"
      : glow && color === "#10B981"
        ? "glow-green"
        : "";

  return (
    <div
      className={`bg-surface border-l-2 border border-border rounded-xl p-5 animate-fade-in-up ${glowClass}`}
      style={{ borderLeftColor: color }}
    >
      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color }}>
        {isCurrency ? "$" : ""}
        {animated.toLocaleString()}
        {suffix && (
          <span className="text-sm font-normal text-text-muted">{suffix}</span>
        )}
      </p>
      <p className="text-xs text-text-muted mt-1">{description}</p>
      {footnote && (
        <p className="text-[10px] text-text-dim mt-1">{footnote}</p>
      )}
    </div>
  );
}
