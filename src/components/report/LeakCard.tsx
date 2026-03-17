"use client";

import Link from "next/link";
import { Leak, LeakType, LEAK_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, getSeverityColor } from "@/lib/utils";
import { REVIEW_ONLY_LEAK_TYPES } from "@/lib/leak-categories";
import { LEAK_TO_ACTIONS } from "@/lib/recovery/types";
import { useState } from "react";

/** Contextual insights that differentiate us from Stripe's raw data */
const WHY_THIS_MATTERS: Partial<Record<LeakType, string>> = {
  failed_payment:
    "23% of customers never retry after a failed charge. Proactive dunning emails within 48 hours recover 3x more than waiting.",
  expiring_card:
    "Proactive card update reminders recover 60% of at-risk subscriptions before the payment even fails.",
  legacy_pricing:
    "SaaS companies that update pricing grandfathered customers see 15-25% revenue lift, but risk churn without careful communication.",
  expired_coupon:
    "Customers rarely notice when an expired promotion is removed. This is typically the safest, highest-ROI fix.",
  never_expiring_discount:
    "Forever discounts compound over time. A 20% discount on a $100/mo plan costs you $240/year per customer — growing with every price increase.",
  stuck_subscription:
    "Stuck subscriptions create phantom MRR in your dashboards. Resolving them gives you accurate revenue numbers to make better decisions.",
  missing_payment_method:
    "Subscriptions without a payment method have a 100% chance of failing at the next billing cycle. Act before the invoice is generated.",
  trial_expired:
    "Expired trials that aren't converted within 48 hours have a 90% lower conversion rate. Speed matters.",
  duplicate_subscription:
    "Duplicate subscriptions often result in customer complaints and refund requests. Catching them early prevents support tickets.",
};

interface LeakCardProps {
  leak: Leak;
  isLoggedIn?: boolean;
  isDemo?: boolean;
  onDismiss?: (customerId: string, leakType: string) => void;
  privacyMode?: boolean;
}

export default function LeakCard({ leak, isLoggedIn, isDemo, onDismiss, privacyMode }: LeakCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissState, setDismissState] = useState<"idle" | "loading" | "dismissed">("idle");
  const [undoLoading, setUndoLoading] = useState(false);
  const severityColor = getSeverityColor(leak.severity);

  async function handleDismiss() {
    setDismissState("loading");
    try {
      const res = await fetch("/api/leaks/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: leak.customerId,
          productId: (leak.metadata?.productId as string) || null,
          leakType: leak.type,
          reason: "intentional",
        }),
      });
      if (res.ok) {
        setDismissState("dismissed");
        onDismiss?.(leak.customerId, leak.type);
      } else {
        setDismissState("idle");
      }
    } catch {
      setDismissState("idle");
    }
  }

  async function handleUndo() {
    setUndoLoading(true);
    try {
      const res = await fetch("/api/leaks/dismiss", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: leak.customerId,
          leakType: leak.type,
        }),
      });
      if (res.ok) {
        setDismissState("idle");
      }
    } catch {
      // ignore
    }
    setUndoLoading(false);
  }

  return (
    <div
      className="bg-surface border border-border border-l-2 rounded-xl overflow-hidden hover:border-border transition"
      style={{ borderLeftColor: severityColor }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left cursor-pointer"
        aria-expanded={expanded}
        aria-label={`${leak.title} — ${formatCurrency(leak.monthlyImpact)}/mo. Click to ${expanded ? "collapse" : "expand"} details`}
      >
        <div className="flex items-start gap-3">
          {/* Severity badge */}
          <span
            className="flex-shrink-0 px-2 py-0.5 text-xs font-bold uppercase rounded tracking-wider mt-0.5"
            style={{
              backgroundColor: `${severityColor}15`,
              color: severityColor,
              border: `1px solid ${severityColor}30`,
            }}
          >
            {leak.severity}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-white leading-tight">
                {leak.title}
              </h4>
              <span className="flex-shrink-0 text-base font-bold text-danger">
                {formatCurrency(leak.monthlyImpact)}/mo
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-muted">
                {LEAK_TYPE_LABELS[leak.type]}
              </span>
              {REVIEW_ONLY_LEAK_TYPES.has(leak.type) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-info bg-info/10 border border-info/20 rounded">
                  Manual Review
                </span>
              )}
              {isLoggedIn && !REVIEW_ONLY_LEAK_TYPES.has(leak.type) && LEAK_TO_ACTIONS[leak.type] && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-brand bg-brand/10 border border-brand/20 rounded">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Auto-Fix Available
                </span>
              )}
              {leak.enrichment?.signals?.found && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#FF7A59] bg-[#FF7A59]/10 border border-[#FF7A59]/20 rounded">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5" />
                  </svg>
                  CRM Enriched
                </span>
              )}
              {!privacyMode && leak.customerEmail && (
                <>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted font-mono">
                    {leak.customerEmail}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Expand icon */}
          <svg
            className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform mt-1 ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${
        expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 border-t border-border-light">
            <div className="mt-3 space-y-3">
            {/* Description */}
            <p className="text-sm text-text-muted leading-relaxed">
              {leak.description}
            </p>

            {/* Why This Matters — contextual insight beyond raw Stripe data */}
            {WHY_THIS_MATTERS[leak.type] && (
              <div className="flex items-start gap-2 bg-white/[0.02] border border-border-light rounded-lg px-3 py-2.5">
                <svg className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                <p className="text-xs text-text-muted leading-relaxed">
                  <span className="font-medium text-brand">Why this matters:</span>{" "}
                  {WHY_THIS_MATTERS[leak.type]}
                </p>
              </div>
            )}

            {/* CRM Intelligence — enrichment detail panel */}
            {leak.enrichment?.signals?.found && leak.enrichment.adjustmentReason && (
              <div className="bg-[#FF7A59]/5 border border-[#FF7A59]/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#FF7A59] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-2.846 2.846a2.25 2.25 0 01-1.591.659H8.637a2.25 2.25 0 01-1.591-.659L4.2 14.5m15.6 0h-1.034a2.25 2.25 0 00-2.25 2.25v1.25" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#FF7A59] mb-1">
                      CRM Intelligence
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {leak.enrichment.adjustmentReason}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2.5">
                      {/* Engagement level badge */}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        leak.enrichment.signals.engagementLevel === "active"
                          ? "text-success bg-success/10 border border-success/20"
                          : leak.enrichment.signals.engagementLevel === "cooling"
                          ? "text-warning bg-warning/10 border border-warning/20"
                          : "text-danger bg-danger/10 border border-danger/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          leak.enrichment.signals.engagementLevel === "active"
                            ? "bg-success"
                            : leak.enrichment.signals.engagementLevel === "cooling"
                            ? "bg-warning"
                            : "bg-danger"
                        }`} />
                        {leak.enrichment.signals.engagementLevel === "active"
                          ? "Active"
                          : leak.enrichment.signals.engagementLevel === "cooling"
                          ? "Cooling Off"
                          : "Inactive"}
                      </span>

                      {/* Days since activity */}
                      {leak.enrichment.signals.daysSinceLastActivity !== null && (
                        <span className="text-[10px] text-text-muted">
                          {leak.enrichment.signals.daysSinceLastActivity}d since last activity
                        </span>
                      )}

                      {/* Severity/recovery adjustments */}
                      {leak.enrichment.severityAdjusted && (
                        <span className="text-[10px] text-warning font-medium">
                          Severity adjusted
                        </span>
                      )}
                      {leak.enrichment.recoveryRateAdjusted && (
                        <span className="text-[10px] text-info font-medium">
                          Recovery rate updated
                        </span>
                      )}

                      {/* HubSpot link */}
                      {leak.enrichment.signals.hubspotUrl && (
                        <a
                          href={leak.enrichment.signals.hubspotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-[#FF7A59] hover:text-[#FF957D] transition"
                        >
                          View in HubSpot
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Impact */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3" style={{ boxShadow: "0 0 20px rgba(239, 68, 68, 0.08)" }}>
                <p className="text-xs text-danger uppercase tracking-wider">
                  Monthly Impact
                </p>
                <p className="text-base font-bold text-danger">
                  {formatCurrency(leak.monthlyImpact)}
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3" style={{ boxShadow: "0 0 20px rgba(245, 158, 11, 0.08)" }}>
                <p className="text-xs text-amber-400 uppercase tracking-wider">
                  If Not Fixed in 30 Days
                </p>
                <p className="text-base font-bold text-amber-400">
                  {formatCurrency(leak.isRecurring ? leak.monthlyImpact : Math.round(leak.monthlyImpact * leak.recoveryRate * 0.5))}
                </p>
                <p className="text-[10px] text-text-dim mt-0.5">
                  {leak.isRecurring ? "compounds monthly" : "recovery drops over time"}
                </p>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg px-4 py-3" style={{ boxShadow: "0 0 20px rgba(245, 158, 11, 0.08)" }}>
                <p className="text-xs text-warning uppercase tracking-wider">
                  Annual Impact
                </p>
                <p className="text-base font-bold text-warning">
                  {formatCurrency(leak.annualImpact)}
                </p>
              </div>
            </div>

            {/* Fix suggestion — gated for demo/non-logged-in, full for paying users */}
            {isDemo || !isLoggedIn ? (
              /* Demo / guest: show auto-fix CTA instead of manual instructions */
              <div className="bg-brand/5 border border-brand/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-brand mb-1">
                      {!REVIEW_ONLY_LEAK_TYPES.has(leak.type) && LEAK_TO_ACTIONS[leak.type]
                        ? "Auto-Fix Available"
                        : "Recovery Guidance Available"}
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {!REVIEW_ONLY_LEAK_TYPES.has(leak.type) && LEAK_TO_ACTIONS[leak.type]
                        ? "Our recovery agents can fix this leak automatically with one click. No manual work needed."
                        : "Get detailed step-by-step guidance on how to resolve this leak safely."}
                    </p>
                    {!isLoggedIn && (
                      <Link
                        href="/auth/signup"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-light transition"
                      >
                        Sign up to activate auto-fix
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Logged-in paying user: show full fix details */
              <div className="bg-brand/5 border border-brand/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-brand mb-1">
                      How to fix
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {leak.fixSuggestion}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {(leak.platformUrl || leak.stripeUrl) && (
                        <a
                          href={leak.platformUrl || leak.stripeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-light transition"
                        >
                          View in Dashboard
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      {!REVIEW_ONLY_LEAK_TYPES.has(leak.type) && LEAK_TO_ACTIONS[leak.type] && (
                        <>
                          {(leak.platformUrl || leak.stripeUrl) && (
                            <span className="text-text-dim">·</span>
                          )}
                          <Link
                            href="/dashboard/actions"
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-light transition"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            Go to Recovery Actions
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advisory callout for leak types without automated recovery */}
            {REVIEW_ONLY_LEAK_TYPES.has(leak.type) && (
              <div className="bg-info/5 border border-info/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-info flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-info mb-1">
                      Why this requires manual review
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Price migrations are a business decision that affect
                      customer relationships. We recommend reviewing each case
                      individually before making changes.
                    </p>
                  </div>
                </div>

                {/* Mark as Intentional */}
                {isLoggedIn && dismissState === "idle" && (
                  <button
                    onClick={handleDismiss}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-text-muted hover:text-white bg-surface border border-border hover:border-brand/40 rounded-lg transition cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    This is intentional — Don&apos;t flag in future scans
                  </button>
                )}
                {isLoggedIn && dismissState === "loading" && (
                  <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 text-xs text-text-muted">
                    <div className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                )}
                {isLoggedIn && dismissState === "dismissed" && (
                  <div className="mt-3 flex items-center justify-between px-3 py-2 bg-success/10 border border-success/20 rounded-lg">
                    <span className="flex items-center gap-2 text-xs font-medium text-success">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Marked as intentional ✓
                    </span>
                    <button
                      onClick={handleUndo}
                      disabled={undoLoading}
                      className="text-xs text-text-muted hover:text-white underline underline-offset-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {undoLoading ? "Undoing..." : "Undo"}
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
