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
    <div className="animate-fade-in-up rounded-2xl border border-[#10B981]/20 bg-gradient-to-br from-[#10B981]/10 via-[#10B981]/5 to-transparent p-6 md:p-8 glow-green">
      {/* Top label */}
      <div className="mb-1 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
          Recoverable Revenue Found
        </span>
      </div>

      {/* Big number */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            ${animatedRecovery.toLocaleString()}
          </span>
          <span className="text-lg font-medium text-[#10B981] md:text-xl">/year</span>
        </div>
        <p className="mt-1 text-sm text-[#999]">
          Identified across {summary.leaksFound} revenue leak{summary.leaksFound !== 1 ? "s" : ""} in your Stripe account
        </p>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* MRR at Risk */}
        <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-3 md:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#EF4444] md:text-xs">
            MRR at Risk
          </p>
          <p className="mt-1 text-lg font-bold text-[#EF4444] md:text-xl">
            ${animatedMrr.toLocaleString()}
            <span className="text-xs font-normal text-[#999]">/mo</span>
          </p>
        </div>

        {/* Leaks Found */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-3 md:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999] md:text-xs">
            Leaks Found
          </p>
          <p className="mt-1 text-lg font-bold text-white md:text-xl">
            {animatedLeaks}
            <span className="text-xs font-normal text-[#999]"> issues</span>
          </p>
        </div>

        {/* Health Score */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-3 md:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999] md:text-xs">
            Health Score
          </p>
          <p className="mt-1 text-lg font-bold md:text-xl" style={{ color: scoreColor }}>
            {summary.healthScore}
            <span className="text-xs font-normal text-[#999]">/100</span>
          </p>
        </div>
      </div>
    </div>
  );
}
