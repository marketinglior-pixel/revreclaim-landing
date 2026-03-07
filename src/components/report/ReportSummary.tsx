"use client";

import { ScanSummary } from "@/lib/types";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import HealthScore from "./HealthScore";

interface ReportSummaryProps {
  summary: ScanSummary;
}

export default function ReportSummary({ summary }: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Health Score - spans 1 col */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-center lg:col-span-1 animate-fade-in-up">
        <HealthScore score={summary.healthScore} />
      </div>

      {/* Stats grid - spans 4 cols */}
      <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          label="MRR at Risk"
          cents={summary.mrrAtRisk}
          suffix="/mo"
          color="#EF4444"
          description={`${Math.min((summary.mrrAtRisk / Math.max(summary.totalMRR, 1)) * 100, 100).toFixed(1)}% of your MRR`}
          delay={100}
          glow={summary.mrrAtRisk > 0}
        />
        <AnimatedStatCard
          label="Leaks Found"
          rawValue={summary.leaksFound}
          color={summary.leaksFound > 0 ? "#F59E0B" : "#10B981"}
          description={`Across ${summary.totalSubscriptions} subscriptions`}
          delay={200}
        />
        <AnimatedStatCard
          label="Annual Recovery"
          cents={summary.recoveryPotential}
          suffix="/yr"
          color="#10B981"
          description="Potential revenue to recover"
          delay={300}
        />
        <AnimatedStatCard
          label="Total MRR"
          cents={summary.totalMRR}
          suffix="/mo"
          color="#3B82F6"
          description={`${summary.totalCustomers} customers`}
          delay={400}
        />
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
  delay,
  glow,
}: {
  label: string;
  cents?: number;
  rawValue?: number;
  suffix?: string;
  color: string;
  description: string;
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
    </div>
  );
}
