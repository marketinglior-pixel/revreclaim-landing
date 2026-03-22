"use client";

import Link from "next/link";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";
import { trackEvent } from "@/lib/analytics";

interface ReportCTAProps {
  mrrAtRisk: number;
  recoveryPotential: number; // annual, in cents — correctly handles one-time vs recurring
  isLoggedIn?: boolean;
  pendingActionsCount?: number;
}

export default function ReportCTA({
  mrrAtRisk,
  recoveryPotential,
  isLoggedIn = false,
  pendingActionsCount = 0,
}: ReportCTAProps) {
  // Use recoveryPotential (not mrrAtRisk*12) — one-time leaks like failed
  // payments should not be annualized
  const annualRiskDollars = Math.round(recoveryPotential / 100);
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
                <ComparisonRow text="One click per leak, AI handles it" check />
                <ComparisonRow text="Dunning emails sent automatically" check />
                <ComparisonRow text="Dashboard tracks everything" check />
                <ComparisonRow text="Weekly auto-scans catch new leaks" check />
                <ComparisonRow text="Time: 0 hours/month" check highlight />
              </ul>
            </div>
          </div>

          {/* ROI Calculator */}
          {monthlyRiskDollars > 0 && (
            <div className="rounded-xl bg-brand/[0.05] border border-brand/10 p-4 mb-8">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Your ROI</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-danger font-display">${monthlyRiskDollars.toLocaleString()}</div>
                  <div className="text-[10px] text-white/30">Your monthly leaks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white/60 font-display">$79</div>
                  <div className="text-[10px] text-white/30">Leak Watch plan</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-brand font-display">{Math.ceil(79 / (monthlyRiskDollars / 30))} days</div>
                  <div className="text-[10px] text-white/30">To break even</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/#pricing"
              onClick={() => { trackEvent("cta_clicked", null, { location: "report", action: "upgrade", mrr_at_risk: monthlyRiskDollars }).catch(() => {}); }}
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

          {/* Share on LinkedIn — viral loop */}
          <div className="mt-6 pt-4 border-t border-white/[0.05]">
            <p className="text-center text-xs text-white/30 mb-3">Share your results</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Just scanned our Stripe billing with @RevReclaim.\n\nFound $${monthlyRiskDollars.toLocaleString()}/mo in revenue leaks we had no idea about.\n\nFree scan, 90 seconds, read-only access: revreclaim.com`
                  );
                  globalThis.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://revreclaim.com")}&summary=${text}`, "_blank");
                  trackEvent("share_clicked", null, { platform: "linkedin", mrr_at_risk: monthlyRiskDollars }).catch(() => {});
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-light hover:border-brand/30 text-sm text-white/70 hover:text-white transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Share on LinkedIn
              </button>
              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Just scanned our Stripe with @RevReclaim. Found $${monthlyRiskDollars.toLocaleString()}/mo in revenue leaks we had no idea about.\n\nFree scan: revreclaim.com`
                  );
                  globalThis.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                  trackEvent("share_clicked", null, { platform: "x", mrr_at_risk: monthlyRiskDollars }).catch(() => {});
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-light hover:border-brand/30 text-sm text-white/70 hover:text-white transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share on X
              </button>
            </div>
          </div>
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
              onClick={() => { trackEvent("cta_clicked", null, { location: "report", action: "view_pricing" }).catch(() => {}); }}
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
