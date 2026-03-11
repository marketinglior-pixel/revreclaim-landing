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
  const monthlyRiskDollars = Math.round(mrrAtRisk / 100);
  const animatedRisk = useAnimatedNumber(annualRiskDollars, 1400, 300);
  const hasActions = isLoggedIn && pendingActionsCount > 0;

  return (
    <div className="bg-gradient-to-br from-brand/10 to-brand-dark/5 border border-brand/20 rounded-xl p-8 glow-green animate-fade-in-up animate-delay-400">
      {hasActions ? (
        /* Logged-in user with actions — direct to fix */
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to Fix These Leaks?</h3>
          <p className="text-text-muted max-w-md mx-auto mb-6">
            We found{" "}
            <span className="text-lg font-bold text-brand">
              {pendingActionsCount} fixable leak{pendingActionsCount !== 1 ? "s" : ""}
            </span>{" "}
            in your billing. Review and auto-fix them with one click.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
          </div>
        </div>
      ) : annualRiskDollars > 0 ? (
        /* Hormozi DIY vs Auto comparison — contrast effort/sacrifice */
        <div>
          <h3 className="text-xl font-bold text-white mb-2 text-center">
            You just found <span className="text-danger">${animatedRisk.toLocaleString()}/year</span> hiding in your billing.
          </h3>
          <p className="text-text-muted max-w-lg mx-auto mb-8 text-center text-sm">
            You can fix these manually (4-6 hours). Or let our AI agent fix them while you build your product.
          </p>

          {/* DIY vs Auto comparison */}
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {/* DIY Column */}
            <div className="rounded-xl border border-border bg-surface-dim p-5">
              <h4 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Fix Yourself (Free)</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <ComparisonRow text="Open each customer in Stripe" />
                <ComparisonRow text="Write dunning emails manually" />
                <ComparisonRow text="Track who responded" />
                <ComparisonRow text="Remember to check next month" />
                <ComparisonRow text="Time: 4-6 hours/month" highlight />
              </ul>
            </div>

            {/* Auto Column */}
            <div className="rounded-xl border border-brand/30 bg-brand/5 p-5">
              <h4 className="text-sm font-semibold text-brand mb-4 uppercase tracking-wider">Fix Automatically (Pro)</h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <ComparisonRow text="One click per leak — AI handles it" check />
                <ComparisonRow text="Dunning emails sent automatically" check />
                <ComparisonRow text="Dashboard tracks everything" check />
                <ComparisonRow text="Weekly auto-scans catch new leaks" check />
                <ComparisonRow text="Time: 0 hours/month" check highlight />
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              Start Auto-Recovering ${monthlyRiskDollars.toLocaleString()}/mo
            </Link>
            <Link
              href="/scan"
              className="px-6 py-3 bg-surface-light hover:bg-surface-lighter text-white font-medium rounded-lg border border-border transition"
            >
              Run Another Scan
            </Link>
          </div>
          <p className="mt-3 text-center text-xs text-text-muted">
            Find less than $1,000/mo? You pay nothing. Cancel anytime.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Your Billing Looks Great!</h3>
          <p className="text-text-muted max-w-md mx-auto mb-6">
            Get weekly scans to make sure it stays that way.
          </p>
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
      )}
    </div>
  );
}

function ComparisonRow({ text, check, highlight }: { text: string; check?: boolean; highlight?: boolean }) {
  return (
    <li className={`flex items-start gap-2 ${highlight ? "font-semibold" : ""}`}>
      {check ? (
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-text-dim" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      )}
      {text}
    </li>
  );
}
