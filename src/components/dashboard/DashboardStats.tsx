"use client";

import { ScanReport } from "@/lib/types";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

export default function DashboardStats({ report }: { report: ScanReport }) {
  const { summary } = report;

  // Animate numbers (values are in cents, animate the dollar amount)
  const animatedMrr = useAnimatedNumber(
    Math.round(summary.mrrAtRisk / 100),
    1200,
    100
  );
  const animatedLeaks = useAnimatedNumber(summary.leaksFound, 800, 200);
  const animatedRecovery = useAnimatedNumber(
    Math.round(summary.recoveryPotential / 100),
    1400,
    300
  );
  const animatedTotalMRR = useAnimatedNumber(
    Math.round(summary.totalMRR / 100),
    1200,
    400
  );

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 animate-fade-in-up animate-delay-200">
      {/* MRR at Risk */}
      <div className="rounded-xl border-t-2 border-t-[#EF4444] border border-[#EF4444]/20 bg-[#EF4444]/5 p-5 glow-red">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[#999]">
          MRR at Risk
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[#EF4444]">
            ${animatedMrr.toLocaleString()}
          </span>
          <span className="text-sm text-[#999]">/mo</span>
        </div>
        <p className="mt-1 text-xs text-[#999]">
          {((summary.mrrAtRisk / Math.max(summary.totalMRR, 1)) * 100).toFixed(1)}% of MRR
        </p>
      </div>

      {/* Leaks Found */}
      <div className="rounded-xl border-t-2 border-t-[#F59E0B] border border-[#2A2A2A] bg-[#111] p-5">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[#999]">
          Leaks Found
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {animatedLeaks}
          </span>
          <span className="text-sm text-[#999]">issues</span>
        </div>
        <p className="mt-1 text-xs text-[#999]">
          Across {summary.totalSubscriptions} subs
        </p>
      </div>

      {/* Annual Recovery */}
      <div className="rounded-xl border-t-2 border-t-[#10B981] border border-[#2A2A2A] bg-[#111] p-5">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[#999]">
          Annual Recovery
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[#10B981]">
            ${animatedRecovery.toLocaleString()}
          </span>
          <span className="text-sm text-[#999]">/yr</span>
        </div>
        <p className="mt-1 text-xs text-[#999]">
          Potential to recover
        </p>
      </div>

      {/* Total MRR */}
      <div className="rounded-xl border-t-2 border-t-[#3B82F6] border border-[#2A2A2A] bg-[#111] p-5">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[#999]">
          Total MRR
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[#3B82F6]">
            ${animatedTotalMRR.toLocaleString()}
          </span>
          <span className="text-sm text-[#999]">/mo</span>
        </div>
        <p className="mt-1 text-xs text-[#999]">
          {summary.totalCustomers} customers
        </p>
      </div>
    </div>
  );
}
