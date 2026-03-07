"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScanReport } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import ReportHeader from "@/components/report/ReportHeader";
import ReportSummary from "@/components/report/ReportSummary";
import LeakCategoryChart from "@/components/report/LeakCategoryChart";
import LeakTable from "@/components/report/LeakTable";
import ReportCTA from "@/components/report/ReportCTA";
import RecoveryBanner from "@/components/report/RecoveryBanner";
import Link from "next/link";

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<ScanReport | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSaveBanner, setShowSaveBanner] = useState(true);

  useEffect(() => {
    async function loadReport() {
      // 1. Try loading from database first (RLS-protected, preferred for auth users)
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setIsLoggedIn(true);
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
          return;
        }
      } catch {
        // DB fetch might fail if not authenticated or Supabase not configured
      }

      // 2. Fall back to sessionStorage (for unauthenticated users who just ran a scan)
      try {
        const stored = sessionStorage.getItem(`report_${reportId}`);
        if (stored) {
          setReport(JSON.parse(stored));
          setLoading(false);
          return;
        }
      } catch {
        // sessionStorage might not be available
      }

      // 3. Not found anywhere
      setNotFound(true);
      setLoading(false);
    }

    loadReport();
  }, [reportId]);

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
          <div className="text-5xl mb-4">🔍</div>
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
      <ReportHeader scannedAt={report.scannedAt} isLoggedIn={isLoggedIn} report={report} />

      {/* Guest save banner */}
      {!isLoggedIn && showSaveBanner && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
            <svg className="w-5 h-5 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="flex-1 text-sm text-warning">
              This report is stored temporarily. <span className="hidden sm:inline">Close this tab and it&apos;s gone.</span>{" "}
              <Link href="/auth/signup" className="font-semibold underline underline-offset-2 hover:text-amber-400 transition">
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
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Recovery Banner */}
        <RecoveryBanner recoveryPotential={report.summary.recoveryPotential} />

        {/* Summary Cards + Health Score */}
        <ReportSummary summary={report.summary} />

        {/* Category Breakdown Chart */}
        {report.categories.length > 0 && (
          <LeakCategoryChart categories={report.categories} />
        )}

        {/* All Leaks Table */}
        <div id="leak-table">
          <LeakTable leaks={report.leaks} />
        </div>

        {/* CTA */}
        <ReportCTA mrrAtRisk={report.summary.mrrAtRisk} />
      </main>
    </div>
  );
}
