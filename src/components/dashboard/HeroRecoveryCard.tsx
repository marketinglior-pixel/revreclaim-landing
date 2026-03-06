"use client";

import { ScanReport } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

export default function HeroRecoveryCard({ report }: { report: ScanReport }) {
  const { summary } = report;

  // Animate the annual recovery number (in cents → we animate dollars)
  const recoveryDollars = Math.round(summary.recoveryPotential / 100);
  const animatedRecovery = useAnimatedNumber(recoveryDollars, 1500, 200);

  const mrrAtRiskDollars = Math.round(summary.mrrAtRisk / 100);
  const animatedMrr = useAnimatedNumber(mrrAtRiskDollars, 1200, 400);

  const animatedLeaks = useAnimatedNumber(summary.leaksFound, 800, 600);

  const scoreColor =
    summary.healthScore >= 80
      ? "#10B981"
      : summary.healthScore >= 60
        ? "#F59E0B"
        : summary.healthScore >= 40
          ? "#F97316"
          : "#EF4444";

  return (
    <div className="animate-fade-in-up rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent p-6 md:p-8 glow-green">
      {/* Top label */}
      <div className="mb-1 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Recoverable Revenue Found
        </span>
      </div>

      {/* Big number */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            ${animatedRecovery.toLocaleString()}
          </span>
          <span className="text-lg font-medium text-brand md:text-xl">/year</span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Identified across {summary.leaksFound} revenue leak{summary.leaksFound !== 1 ? "s" : ""} in your Stripe account
        </p>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* MRR at Risk */}
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-danger">
            MRR at Risk
          </p>
          <p className="mt-1 text-lg font-bold text-danger md:text-xl">
            ${animatedMrr.toLocaleString()}
            <span className="text-xs font-normal text-text-muted">/mo</span>
          </p>
        </div>

        {/* Leaks Found */}
        <div className="rounded-xl border border-border bg-surface-dim p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Leaks Found
          </p>
          <p className="mt-1 text-lg font-bold text-white md:text-xl">
            {animatedLeaks}
            <span className="text-xs font-normal text-text-muted"> issues</span>
          </p>
        </div>

        {/* Health Score */}
        <div className="rounded-xl border border-border bg-surface-dim p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Health Score
          </p>
          <p className="mt-1 text-lg font-bold md:text-xl" style={{ color: scoreColor }}>
            {summary.healthScore}
            <span className="text-xs font-normal text-text-muted">/100</span>
          </p>
        </div>
      </div>
    </div>
  );
}
