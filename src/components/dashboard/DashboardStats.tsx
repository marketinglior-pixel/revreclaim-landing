"use client";

import { ScanReport } from "@/lib/types";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

export default function DashboardStats({ report }: { report: ScanReport }) {
  const { summary } = report;

  // TODO: Replace with real recovered amount from DB when tracking is built
  const recoveredCents = 0;

  const animatedRecovered = useAnimatedNumber(
    Math.round(recoveredCents / 100),
    1200,
    0
  );
  const animatedAtRisk = useAnimatedNumber(
    Math.round(summary.mrrAtRisk / 100),
    1200,
    100
  );
  const animatedFixed = useAnimatedNumber(0, 800, 200); // TODO: track fixed count

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
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:gap-6 animate-fade-in-up animate-delay-200">
      {/* Revenue Recovered — THE hero metric */}
      <div className="rounded-xl border-t-2 border-t-brand border border-brand/20 bg-brand/5 backdrop-blur-sm p-6">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          Revenue Recovered
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-brand">
            ${animatedRecovered.toLocaleString()}
          </span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {recoveredCents === 0 ? "Run your agents to start recovering" : "Last 30 days"}
        </p>
      </div>

      {/* Revenue at Risk */}
      <div className="rounded-xl border-t-2 border-t-danger border border-danger/20 bg-danger/5 backdrop-blur-sm p-6">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <svg className="h-3.5 w-3.5 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          Revenue at Risk
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-danger">
            ${animatedAtRisk.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted">/mo</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Across {summary.leaksFound} issues in {summary.totalSubscriptions} subs
        </p>
      </div>

      {/* Leaks Fixed */}
      <div className="rounded-xl border-t-2 border-t-brand border border-border bg-surface/80 backdrop-blur-sm p-6">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Leaks Fixed
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">
            {animatedFixed}
          </span>
          <span className="text-sm text-text-muted">of {summary.leaksFound}</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {summary.leaksFound === 0 ? "No leaks found" : `${summary.leaksFound} still need attention`}
        </p>
      </div>
    </div>
    </>
  );
}
