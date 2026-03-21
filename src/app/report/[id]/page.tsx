"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Leak, ScanReport, LEAK_TYPE_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PlanType } from "@/lib/plan-limits";
import ReportHeader from "@/components/report/ReportHeader";
import ReportSummary from "@/components/report/ReportSummary";
import BillingHealthInsights from "@/components/report/BillingHealthInsights";
import LeakCategoryChart from "@/components/report/LeakCategoryChart";
import LeakTable from "@/components/report/LeakTable";
import ReportCTA from "@/components/report/ReportCTA";
import RecoveryBanner from "@/components/report/RecoveryBanner";
import QuickWins from "@/components/report/QuickWins";
import DailyCostTicker from "@/components/report/DailyCostTicker";
import Link from "next/link";

/** Key used to deduplicate dismissals */
function dismissKey(customerId: string, leakType: string) {
  return `${customerId}::${leakType}`;
}

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<ScanReport | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSaveBanner, setShowSaveBanner] = useState(true);
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [emailForReport, setEmailForReport] = useState("");
  const [emailSendStatus, setEmailSendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  useEffect(() => {
    async function loadReport() {
      // 1. Try loading from database first (RLS-protected, preferred for auth users)
      let userLoggedIn = false;
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          userLoggedIn = true;
          // Fetch user plan
          supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile?.plan) setUserPlan(profile.plan as PlanType);
            });
        }
        const { data: row, error } = await supabase
          .from("reports")
          .select("id, created_at, platform, summary, categories, leaks")
          .eq("id", reportId)
          .single();

        if (row && !error) {
          const r = row as Record<string, unknown>;
          const dbReport: ScanReport = {
            id: r.id as string,
            platform: (r.platform as string) || "stripe",
            scannedAt: r.created_at as string,
            summary: r.summary as unknown as ScanReport["summary"],
            categories: r.categories as unknown as ScanReport["categories"],
            leaks: r.leaks as unknown as ScanReport["leaks"],
          };
          setReport(dbReport);
          // Clear sessionStorage copy now that we loaded from DB (reduce PII exposure)
          try { sessionStorage.removeItem(`report_${reportId}`); } catch { /* ignore */ }
          setLoading(false);

          // Load dismissals + pending actions + privacy mode for logged-in users
          if (userLoggedIn) {
            loadDismissals();
            loadPendingActions();
            // Fetch privacy mode setting
            supabase
              .from("scan_configs")
              .select("privacy_mode")
              .eq("user_id", user!.id)
              .single()
              .then(({ data: scanConfig }) => {
                if (scanConfig?.privacy_mode) setPrivacyMode(true);
              });
          }
          return;
        }
      } catch {
        // DB fetch might fail if not authenticated or Supabase not configured
      }

      // 2. Fall back to sessionStorage (for unauthenticated users who just ran a scan)
      try {
        const stored = sessionStorage.getItem(`report_${reportId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setReport(parsed);
          setLoading(false);

          // If user just signed in, claim this guest report to their account
          if (userLoggedIn) {
            fetch("/api/claim-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reportId: parsed.id,
                platform: parsed.platform,
                summary: parsed.summary,
                categories: parsed.categories,
                leaks: parsed.leaks,
              }),
            }).then(() => {
              try { sessionStorage.removeItem(`report_${reportId}`); } catch { /* ignore */ }
            }).catch(() => { /* non-critical */ });
          }
          return;
        }
      } catch {
        // sessionStorage might not be available
      }

      // 3. Not found anywhere
      setNotFound(true);
      setLoading(false);
    }

    async function loadPendingActions() {
      try {
        const res = await fetch(`/api/actions?status=pending&report_id=${reportId}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          setPendingActionsCount(data.actions?.length ?? 0);
        }
      } catch {
        // Non-critical — actions count just won't show
      }
    }

    async function loadDismissals() {
      try {
        const res = await fetch("/api/leaks/dismiss");
        if (res.ok) {
          const { dismissals } = await res.json();
          if (dismissals && dismissals.length > 0) {
            const keys = new Set<string>(
              dismissals.map((d: { customer_id: string; leak_type: string }) =>
                dismissKey(d.customer_id, d.leak_type)
              )
            );
            setDismissedKeys(keys);
          }
        }
      } catch {
        // Non-critical — dismissals just won't be filtered
      }
    }

    loadReport();
  }, [reportId]);

  /** Called when user dismisses a leak from LeakCard */
  const handleDismiss = useCallback((customerId: string, leakType: string) => {
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(dismissKey(customerId, leakType));
      return next;
    });
  }, []);

  /** Filter out dismissed leaks */
  const visibleLeaks: Leak[] = useMemo(() => {
    if (!report || dismissedKeys.size === 0) return report?.leaks ?? [];
    return report.leaks.filter(
      (l) => !dismissedKeys.has(dismissKey(l.customerId, l.type))
    );
  }, [report, dismissedKeys]);

  /** Recompute summary without dismissed leaks (weighted by recovery rate) */
  const adjustedSummary = useMemo(() => {
    if (!report) return undefined;
    if (dismissedKeys.size === 0) return report.summary;
    const mrrAtRisk = visibleLeaks.reduce(
      (sum, l) => sum + Math.round(l.monthlyImpact * (l.recoveryRate ?? 1)),
      0
    );
    const rawMrrAtRisk = visibleLeaks.reduce((sum, l) => sum + l.monthlyImpact, 0);
    const recoveryPotential = visibleLeaks.reduce(
      (sum, l) => sum + Math.round(l.annualImpact * (l.recoveryRate ?? 1)),
      0
    );
    return {
      ...report.summary,
      mrrAtRisk,
      rawMrrAtRisk,
      recoveryPotential,
      leaksFound: visibleLeaks.length,
    };
  }, [report, dismissedKeys, visibleLeaks]);

  const dismissedCount = report ? report.leaks.length - visibleLeaks.length : 0;

  /** Compute recovered revenue from dismissed leaks */
  const recoveredAmount = useMemo(() => {
    if (!report || dismissedKeys.size === 0) return 0;
    return report.leaks
      .filter((l) => dismissedKeys.has(dismissKey(l.customerId, l.type)))
      .reduce((sum, l) => sum + l.monthlyImpact, 0);
  }, [report, dismissedKeys]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-text-muted">Loading report...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mb-4">
            <svg className="h-12 w-12 mx-auto text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Report Not Found
          </h1>
          <p className="text-text-muted mb-6">
            This report may have expired or the link is invalid. Sign in to
            access your saved reports, or run a new scan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex px-6 py-3 border border-border hover:border-brand text-white font-medium rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/scan"
              className="inline-flex px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition"
            >
              Run a New Scan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-surface-dim">
      <ReportHeader scannedAt={report.scannedAt} isLoggedIn={isLoggedIn} report={report} privacyMode={privacyMode} />

      {/* Guest save banner with email option */}
      {!isLoggedIn && showSaveBanner && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="flex-1 text-sm text-warning">
                This report is stored temporarily. <span className="hidden sm:inline">Close this tab and it&apos;s gone.</span>{" "}
                <Link href={`/auth/signup?redirect=/report/${reportId}`} className="font-semibold underline underline-offset-2 hover:text-amber-400 transition">
                  Create a free account
                </Link>{" "}
                to save it permanently.
              </p>
              <button
                onClick={() => setShowSaveBanner(false)}
                className="text-warning/60 hover:text-warning transition cursor-pointer"
                aria-label="Dismiss save banner"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Email me this report */}
            {emailSendStatus === "sent" ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-brand">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Report sent! Check your inbox.
              </div>
            ) : (
              <form
                className="mt-3 flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!emailForReport || !emailForReport.includes("@")) return;
                  setEmailSendStatus("loading");
                  try {
                    const res = await fetch("/api/email-report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: emailForReport,
                        reportId,
                        summary: report?.summary,
                        leakCount: visibleLeaks.length,
                        topLeaks: visibleLeaks.slice(0, 3).map(l => ({
                          type: LEAK_TYPE_LABELS[l.type] || l.type,
                          impact: Math.round(l.monthlyImpact / 100),
                        })),
                      }),
                    });
                    setEmailSendStatus(res.ok ? "sent" : "error");
                  } catch {
                    setEmailSendStatus("error");
                  }
                }}
              >
                <input
                  type="email"
                  value={emailForReport}
                  onChange={(e) => setEmailForReport(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-white placeholder:text-text-dim focus:border-brand focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={emailSendStatus === "loading"}
                  className="rounded-lg bg-surface-light border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-white hover:border-brand/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {emailSendStatus === "loading" ? "..." : "Email Me This Report"}
                </button>
              </form>
            )}
            {emailSendStatus === "error" && (
              <p className="mt-1 text-xs text-danger">Failed to send. Try creating a free account instead.</p>
            )}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Biggest Leak Highlight — Von Restorff Effect */}
        {visibleLeaks.length > 0 && (() => {
          const biggest = visibleLeaks.reduce((max, l) => l.monthlyImpact > max.monthlyImpact ? l : max, visibleLeaks[0]);
          const impactDollars = Math.round(biggest.monthlyImpact / 100);
          const dailyCost = Math.round(impactDollars / 30);
          return (
            <div className="rounded-2xl border border-danger/30 bg-gradient-to-r from-danger/10 to-danger/5 p-6 animate-fade-in-up">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/15 flex-shrink-0">
                  <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-danger mb-1">Your Biggest Leak</p>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {LEAK_TYPE_LABELS[biggest.type] || biggest.type}: ${impactDollars.toLocaleString()}/mo
                  </h3>
                  <p className="text-sm text-text-muted mb-3">
                    {biggest.description || `This single issue is costing you $${dailyCost}/day.`}
                  </p>
                  {biggest.fixSuggestion && (
                    <p className="text-xs text-text-secondary mb-2">
                      <span className="font-semibold text-brand">How to fix:</span>{" "}
                      {biggest.fixSuggestion}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {(biggest.platformUrl || biggest.stripeUrl) && (
                      <a
                        href={biggest.platformUrl || biggest.stripeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand/15 border border-brand/25 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/25 transition"
                      >
                        Open in Dashboard
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    <a
                      href="#leak-table"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-danger/15 border border-danger/25 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/25 transition"
                    >
                      See All Leaks
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-extrabold text-danger">${impactDollars.toLocaleString()}</span>
                  <span className="text-sm text-danger/70">/mo</span>
                  <p className="text-xs text-text-muted mt-1">${(impactDollars * 12).toLocaleString()}/year</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Daily Cost Ticker — urgency using actual scan data */}
        <DailyCostTicker mrrAtRisk={adjustedSummary?.mrrAtRisk ?? report.summary.mrrAtRisk} />

        {/* Recovery Banner */}
        <RecoveryBanner
          mrrAtRisk={adjustedSummary?.mrrAtRisk ?? report.summary.mrrAtRisk}
          isLoggedIn={isLoggedIn}
          pendingActionsCount={pendingActionsCount}
        />

        {/* Actions Generated Banner (logged-in users with recovery actions) */}
        {isLoggedIn && pendingActionsCount > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-brand/5 px-5 py-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15">
                <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {pendingActionsCount} recovery action{pendingActionsCount !== 1 ? "s" : ""} generated from this scan
                </p>
                <p className="text-xs text-text-muted">
                  Auto-fix leaks with payment reminders, retry charges, and more.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/actions"
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-black hover:bg-brand-light transition"
            >
              Review &amp; Auto-Fix
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        )}

        {/* Revenue Recovered — shown when user has dismissed/fixed leaks */}
        {dismissedCount > 0 && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-xl animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {recoveredAmount > 0
                    ? `${formatCurrency(recoveredAmount)}/mo recovered`
                    : `${dismissedCount} leak${dismissedCount !== 1 ? "s" : ""} resolved`}
                </p>
                <p className="text-xs text-text-muted">
                  {dismissedCount} leak{dismissedCount !== 1 ? "s" : ""} marked as fixed.{" "}
                  <span className="text-text-dim">These won&apos;t appear in future scans.</span>
                </p>
              </div>
            </div>
            {recoveredAmount > 0 && (
              <span className="flex-shrink-0 text-lg font-bold text-brand">
                {formatCurrency(recoveredAmount * 12)}/yr
              </span>
            )}
          </div>
        )}

        {/* Summary Cards + Health Score */}
        <ReportSummary summary={adjustedSummary ?? report.summary} leaks={visibleLeaks} />

        {/* Billing Health Breakdown */}
        {report.billingHealth && (
          <BillingHealthInsights billingHealth={report.billingHealth} />
        )}

        {/* Category Breakdown Chart */}
        {report.categories.length > 0 && (
          <LeakCategoryChart categories={report.categories} />
        )}

        {/* Quick Wins — start here summary */}
        <QuickWins leaks={visibleLeaks} />

        {/* What's Next — guided path based on auth state */}
        {visibleLeaks.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-1">What to do next</h3>
            <p className="text-sm text-text-muted mb-6">
              You have {visibleLeaks.length} billing hole{visibleLeaks.length !== 1 ? "s" : ""}. Here&apos;s how to fix them, starting with the easiest.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">1</div>
                <div>
                  <p className="text-sm font-semibold text-white">Fix the quick wins (5 min)</p>
                  <p className="text-xs text-text-muted">
                    Scroll up to &ldquo;Quick Fixes&rdquo; &mdash; these have the highest recovery rate.
                    Each leak links directly to your billing dashboard.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">2</div>
                <div>
                  <p className="text-sm font-semibold text-white">Review the rest</p>
                  <p className="text-xs text-text-muted">
                    Items under &ldquo;Needs Review&rdquo; require a business decision (e.g. whether
                    to migrate legacy-priced customers). No rush, but worth looking at.
                  </p>
                </div>
              </div>
              {!isLoggedIn ? (
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10 text-sm font-bold text-warning">3</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Save this report</p>
                    <p className="text-xs text-text-muted">
                      This report lives in your browser right now. Close the tab and it&apos;s gone.{" "}
                      <Link href={`/auth/signup?redirect=/report/${reportId}`} className="text-brand hover:text-brand-light transition underline underline-offset-2">
                        Create a free account
                      </Link>{" "}
                      to save it and track changes over time.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">3</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Set up monitoring</p>
                    <p className="text-xs text-text-muted">
                      New leaks appear every week (failed payments, expiring cards).{" "}
                      <Link href="/dashboard/settings" className="text-brand hover:text-brand-light transition underline underline-offset-2">
                        Turn on weekly scans
                      </Link>{" "}
                      to catch them automatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Leaks Table */}
        <div id="leak-table">
          <LeakTable leaks={visibleLeaks} isLoggedIn={isLoggedIn} isPaidUser={userPlan !== "free"} isDemo={false} onDismiss={handleDismiss} privacyMode={privacyMode} />
        </div>

        {/* CTA */}
        <ReportCTA
          mrrAtRisk={adjustedSummary?.mrrAtRisk ?? report.summary.mrrAtRisk}
          recoveryPotential={adjustedSummary?.recoveryPotential ?? report.summary.recoveryPotential}
          isLoggedIn={isLoggedIn}
          pendingActionsCount={pendingActionsCount}
        />
      </main>
    </div>
  );
}
