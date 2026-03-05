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
import Link from "next/link";

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<ScanReport | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      // 1. Try sessionStorage first (fastest)
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

      // 2. Try loading from database (for logged-in users)
      try {
        const supabase = createClient();
        const { data: row, error } = await supabase
          .from("reports")
          .select("id, created_at, summary, categories, leaks")
          .eq("id", reportId)
          .single();

        if (row && !error) {
          const r = row as Record<string, unknown>;
          const dbReport: ScanReport = {
            id: r.id as string,
            scannedAt: r.created_at as string,
            summary: r.summary as unknown as ScanReport["summary"],
            categories: r.categories as unknown as ScanReport["categories"],
            leaks: r.leaks as unknown as ScanReport["leaks"],
          };
          setReport(dbReport);
          // Cache in sessionStorage for faster subsequent loads
          sessionStorage.setItem(`report_${reportId}`, JSON.stringify(dbReport));
          setLoading(false);
          return;
        }
      } catch {
        // DB fetch might fail if not authenticated or Supabase not configured
      }

      // 3. Not found anywhere
      setNotFound(true);
      setLoading(false);
    }

    loadReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#999]">Loading report...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Report Not Found
          </h1>
          <p className="text-[#999] mb-6">
            This report may have expired or the link is invalid. Sign in to
            access your saved reports, or run a new scan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex px-6 py-3 border border-[#2A2A2A] hover:border-[#10B981] text-white font-medium rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/scan"
              className="inline-flex px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition"
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
    <div className="min-h-screen bg-[#0A0A0A]">
      <ReportHeader scannedAt={report.scannedAt} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards + Health Score */}
        <ReportSummary summary={report.summary} />

        {/* Category Breakdown Chart */}
        {report.categories.length > 0 && (
          <LeakCategoryChart categories={report.categories} />
        )}

        {/* All Leaks Table */}
        <LeakTable leaks={report.leaks} />

        {/* CTA */}
        <ReportCTA mrrAtRisk={report.summary.mrrAtRisk} />
      </main>
    </div>
  );
}
