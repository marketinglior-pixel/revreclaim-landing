"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScanReport } from "@/lib/types";
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

  useEffect(() => {
    // Try to load report from sessionStorage
    const stored = sessionStorage.getItem(`report_${reportId}`);
    if (stored) {
      try {
        setReport(JSON.parse(stored));
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [reportId]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Report Not Found
          </h1>
          <p className="text-[#999] mb-6">
            This report may have expired or the link is invalid. Reports are
            stored in your browser session and are cleared when you close the
            tab.
          </p>
          <Link
            href="/scan"
            className="inline-flex px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition"
          >
            Run a New Scan
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#999]">Loading report...</span>
        </div>
      </div>
    );
  }

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
