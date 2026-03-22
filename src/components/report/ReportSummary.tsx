"use client";

import { Leak, ScanSummary } from "@/lib/types";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import HealthScore from "./HealthScore";

interface ReportSummaryProps {
  summary: ScanSummary;
  leaks?: Leak[];
}

export default function ReportSummary({ summary }: ReportSummaryProps) {
  // % of MRR at risk
  const mrrAtRiskPct = summary.totalMRR > 0
    ? Math.min((summary.mrrAtRisk / summary.totalMRR) * 100, 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Health Score */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-center animate-fade-in-up">
        <HealthScore score={summary.healthScore} />
      </div>

      {/* MRR at Risk */}
      <AnimatedStatCard
        label="MRR at Risk"
        cents={summary.mrrAtRisk}
        suffix="/mo"
        color="#EF4444"
        description={`${mrrAtRiskPct.toFixed(1)}% of your MRR`}
        delay={100}
        glow={summary.mrrAtRisk > 0}
      />

      {/* Leaks Found */}
      <AnimatedStatCard
        label="Leaks Found"
        rawValue={summary.leaksFound}
        color={summary.leaksFound > 0 ? "#EF4444" : "#10B981"}
        description={`Across ${summary.totalSubscriptions} subscriptions`}
        delay={200}
      />
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
