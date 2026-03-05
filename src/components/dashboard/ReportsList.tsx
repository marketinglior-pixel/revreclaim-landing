"use client";

import { ScanReport } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function ReportsList({ reports }: { reports: ScanReport[] }) {
  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Scan History</h2>
        <span className="text-xs text-[#666]">{reports.length} report{reports.length === 1 ? "" : "s"}</span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-[#666] border-b border-[#1A1A1A]">
        <div className="col-span-3">Date</div>
        <div className="col-span-2">Health</div>
        <div className="col-span-2">Leaks</div>
        <div className="col-span-3">MRR at Risk</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* Rows */}
      {reports.map((report) => {
        const date = new Date(report.scannedAt);
        const scoreColor =
          report.summary.healthScore >= 80
            ? "text-[#10B981]"
            : report.summary.healthScore >= 60
              ? "text-[#F59E0B]"
              : report.summary.healthScore >= 40
                ? "text-[#F97316]"
                : "text-[#EF4444]";

        return (
          <Link
            key={report.id}
            href={`/report/${report.id}`}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1A1A1A] hover:bg-[#1A1A1A]/50 transition items-center group"
          >
            <div className="col-span-3">
              <p className="text-sm text-white">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-[#666]">
                {date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="col-span-2">
              <span className={`text-lg font-bold ${scoreColor}`}>
                {report.summary.healthScore}
              </span>
              <span className="text-xs text-[#666]">/100</span>
            </div>

            <div className="col-span-2">
              <span className="text-sm text-white font-medium">
                {report.summary.leaksFound}
              </span>
              {report.summary.leaksFound > 0 && (
                <span className="text-xs text-[#666] ml-1">found</span>
              )}
            </div>

            <div className="col-span-3">
              <span className="text-sm font-bold text-[#EF4444]">
                {formatCurrency(report.summary.mrrAtRisk)}
              </span>
              <span className="text-xs text-[#666]">/mo</span>
            </div>

            <div className="col-span-2 text-right">
              <span className="text-xs text-[#10B981] font-medium group-hover:text-[#34D399] transition">
                View Report →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
