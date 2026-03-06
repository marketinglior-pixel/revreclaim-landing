"use client";

import Link from "next/link";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface ReportCTAProps {
  mrrAtRisk: number;
}

export default function ReportCTA({ mrrAtRisk }: ReportCTAProps) {
  const annualRiskDollars = Math.round((mrrAtRisk * 12) / 100);
  const animatedRisk = useAnimatedNumber(annualRiskDollars, 1400, 300);

  return (
    <div className="bg-gradient-to-br from-brand/10 to-brand-dark/5 border border-brand/20 rounded-xl p-8 text-center glow-green animate-fade-in-up animate-delay-400">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full mb-4">
        <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
        <span className="text-xs font-medium text-brand">
          Coming Soon
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        Want Continuous Monitoring?
      </h3>

      {annualRiskDollars > 0 ? (
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
      </div>
    </div>
  );
}
