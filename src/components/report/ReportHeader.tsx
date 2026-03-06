"use client";

import Link from "next/link";
import { ScanReport } from "@/lib/types";

interface ReportHeaderProps {
  scannedAt: string;
  isLoggedIn?: boolean;
  report?: ScanReport;
}

export default function ReportHeader({ scannedAt, isLoggedIn = false, report }: ReportHeaderProps) {
  const date = new Date(scannedAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  async function handleExportPDF() {
    if (!report) return;
    const { exportReportPDF } = await import("@/lib/export-pdf");
    exportReportPDF(report);
  }

  async function handleExportCSV() {
    if (!report) return;
    const { exportReportCSV } = await import("@/lib/export-csv");
    exportReportCSV(report);
  }

  return (
    <header className="border-b border-border bg-surface-dim/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="text-lg font-bold text-white flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            RevReclaim
          </Link>
          <div className="hidden sm:block h-5 w-px bg-border" />
          <span className="hidden sm:block text-sm text-text-muted">
            Revenue Leak Report
          </span>
        </div>

        <div className="flex items-center gap-2 min-h-[44px]">
          <span className="text-xs text-text-muted hidden lg:block">
            {formattedDate} at {formattedTime}
          </span>

          {/* Export buttons */}
          {report && (
            <>
              <button
                onClick={handleExportPDF}
                className="px-3 py-2 text-xs font-medium text-text-muted border border-border rounded-lg min-h-[36px] hover:text-white hover:border-brand/30 transition cursor-pointer hidden sm:flex items-center gap-1"
                aria-label="Export as PDF"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 text-xs font-medium text-text-muted border border-border rounded-lg min-h-[36px] hover:text-white hover:border-brand/30 transition cursor-pointer hidden sm:flex items-center gap-1"
                aria-label="Export as CSV"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                CSV
              </button>
            </>
          )}

          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="px-3 py-2 text-xs font-medium text-text-muted border border-border rounded-lg min-h-[36px] hover:text-white hover:border-brand/30 transition hidden sm:block"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/scan"
            className="px-3 py-2 text-xs font-medium bg-brand/10 text-brand border border-brand/20 rounded-lg min-h-[36px] hover:bg-brand/20 transition"
          >
            Run New Scan
          </Link>
        </div>
      </div>
    </header>
  );
}
