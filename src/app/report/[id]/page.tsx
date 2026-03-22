"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Leak, ScanReport, LEAK_TYPE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { PlanType } from "@/lib/plan-limits";
import ReportHeader from "@/components/report/ReportHeader";
import ReportSummary from "@/components/report/ReportSummary";
import LeakTable from "@/components/report/LeakTable";
import ReportCTA from "@/components/report/ReportCTA";
import QuickWins from "@/components/report/QuickWins";
import { PostScanSurvey } from "@/components/report/PostScanSurvey";
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
        {/* Summary Cards + Health Score */}
        <ReportSummary summary={adjustedSummary ?? report.summary} leaks={visibleLeaks} />

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-4 text-xs text-text-dim py-1">
          <span>Read-only API access</span>
          <span className="text-white/10">·</span>
          <span>AES-256 encrypted</span>
          <span className="text-white/10">·</span>
          <span>Key deleted after scan</span>
        </div>

        {/* Recovery Actions Banner (compact, only when actions exist) */}
        {isLoggedIn && pendingActionsCount > 0 && (
          <Link
            href="/dashboard/actions"
            className="flex items-center justify-between rounded-xl border border-brand/20 bg-brand/5 px-5 py-3 hover:bg-brand/10 transition animate-fade-in-up"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span className="text-sm font-semibold text-white">
                {pendingActionsCount} recovery action{pendingActionsCount !== 1 ? "s" : ""} ready to review
              </span>
            </div>
            <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        )}

        {/* Quick Wins — start here summary */}
        <QuickWins leaks={visibleLeaks} />

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

        {/* Post-scan survey — shows after 5 min for PH validation */}
        <div className="mt-8">
          <PostScanSurvey firstScanDate={new Date().toISOString()} userPlan={userPlan} />
        </div>
      </main>
    </div>
  );
}
