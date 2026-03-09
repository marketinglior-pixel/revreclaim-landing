"use client";

import Link from "next/link";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface ReportCTAProps {
  mrrAtRisk: number;
  isLoggedIn?: boolean;
  pendingActionsCount?: number;
}

export default function ReportCTA({
  mrrAtRisk,
  isLoggedIn = false,
  pendingActionsCount = 0,
}: ReportCTAProps) {
  const annualRiskDollars = Math.round((mrrAtRisk * 12) / 100);
  const animatedRisk = useAnimatedNumber(annualRiskDollars, 1400, 300);
  const hasActions = isLoggedIn && pendingActionsCount > 0;

  return (
    <div className="bg-gradient-to-br from-brand/10 to-brand-dark/5 border border-brand/20 rounded-xl p-8 text-center glow-green animate-fade-in-up animate-delay-400">
      <h3 className="text-xl font-bold text-white mb-2">
        {hasActions ? "Ready to Fix These Leaks?" : "Want Continuous Monitoring?"}
      </h3>

      {hasActions ? (
        <p className="text-text-muted max-w-md mx-auto mb-6">
          We found{" "}
          <span className="text-lg font-bold text-brand">
            {pendingActionsCount} fixable leak{pendingActionsCount !== 1 ? "s" : ""}
          </span>{" "}
          in your billing. Review and auto-fix them with one click.
        </p>
      ) : annualRiskDollars > 0 ? (
        <p className="text-text-muted max-w-md mx-auto mb-6">
          You&apos;re at risk of losing{" "}
          <span className="text-2xl font-bold text-danger">
            ${animatedRisk.toLocaleString()}
          </span>
          /year. Get weekly scans with automated alerts so you catch leaks before they cost you.
        </p>
      ) : (
        <p className="text-text-muted max-w-md mx-auto mb-6">
          Your billing looks great! Get weekly scans to make sure it stays that way.
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {hasActions ? (
          <>
            <Link
              href="/dashboard/actions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Fix {pendingActionsCount} Leak{pendingActionsCount !== 1 ? "s" : ""} Now
            </Link>
            <Link
              href="/scan"
              className="px-6 py-3 bg-surface-light hover:bg-surface-lighter text-white font-medium rounded-lg border border-border transition"
            >
              Run Another Scan
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/#pricing"
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              View Pricing Plans
            </Link>
            <Link
              href="/scan"
              className="px-6 py-3 bg-surface-light hover:bg-surface-lighter text-white font-medium rounded-lg border border-border transition"
            >
              Run Another Scan
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
