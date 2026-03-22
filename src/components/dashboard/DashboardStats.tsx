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
    Math.round(summary.mrrAtRisk / 100),
    1400,
    300
  );
  const animatedTotalMRR = useAnimatedNumber(
    Math.round(summary.totalMRR / 100),
    1200,
    400
  );

  // Check if MRR at risk equals total MRR (cap was hit)
  const isCritical = summary.totalMRR > 0 && summary.mrrAtRisk >= summary.totalMRR;

  return (
    <>
    {isCritical && (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 mb-4 animate-fade-in-up">
        <p className="text-xs text-danger font-medium">
          Your billing health is critical. Multiple leaks are affecting most of your revenue. Start fixing the highest-impact ones now.
        </p>
      </div>
    )}
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:gap-6 animate-fade-in-up animate-delay-200">
      {/* MRR at Risk */}
      <div className="rounded-xl border-t-2 border-t-danger border border-danger/20 bg-danger/5 backdrop-blur-sm p-5 glow-red">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          Revenue at Risk
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-danger">
            ${animatedMrr.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted">/mo</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {Math.min((summary.mrrAtRisk / Math.max(summary.totalMRR, 1)) * 100, 100).toFixed(1)}% of MRR
        </p>
      </div>

      {/* Leaks Found */}
      <div className="rounded-xl border-t-2 border-t-danger border border-border bg-surface/80 backdrop-blur-sm p-5">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          Issues Found
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {animatedLeaks}
          </span>
          <span className="text-sm text-text-muted">issues</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Across {summary.totalSubscriptions} subs
        </p>
      </div>

      {/* Monthly Recoverable */}
      <div className="rounded-xl border-t-2 border-t-brand border border-border bg-surface/80 backdrop-blur-sm p-5">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          Recovery Potential
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-brand">
            ${animatedRecovery.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted">/mo</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Weighted by recovery likelihood
        </p>
      </div>

      {/* Total MRR */}
      <div className="rounded-xl border-t-2 border-t-brand border border-border bg-surface/80 backdrop-blur-sm p-5">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
          Your MRR
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-brand">
            ${animatedTotalMRR.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted">/mo</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {summary.totalCustomers} customers
        </p>
      </div>
    </div>
    </>
  );
}
