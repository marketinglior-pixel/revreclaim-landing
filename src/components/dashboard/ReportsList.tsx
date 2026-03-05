"use client";

import { ScanReport } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

function getScoreColor(score: number) {
  if (score >= 80) return "text-[#10B981]";
  if (score >= 60) return "text-[#F59E0B]";
  if (score >= 40) return "text-[#F97316]";
  return "text-[#EF4444]";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-[#10B981]/10 text-[#10B981]";
  if (score >= 60) return "bg-[#F59E0B]/10 text-[#F59E0B]";
  if (score >= 40) return "bg-[#F97316]/10 text-[#F97316]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
}

export default function ReportsList({ reports }: { reports: ScanReport[] }) {
  return (
    <div className="animate-fade-in-up animate-delay-400">
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Scan History</h2>
          <span className="text-xs text-[#999]">
            {reports.length} report{reports.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-[#999] border-b border-[#1A1A1A]">
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Health</div>
            <div className="col-span-2">Leaks</div>
            <div className="col-span-3">MRR at Risk</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Rows */}
          {reports.map((report) => {
            const date = new Date(report.scannedAt);
            const scoreColor = getScoreColor(report.summary.healthScore);

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
                  <p className="text-xs text-[#999]">
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
                  <span className="text-xs text-[#999]">/100</span>
                </div>

                <div className="col-span-2">
                  <span className="text-sm text-white font-medium">
                    {report.summary.leaksFound}
                  </span>
                  {report.summary.leaksFound > 0 && (
                    <span className="text-xs text-[#999] ml-1">found</span>
                  )}
                </div>

                <div className="col-span-3">
                  <span className="text-sm font-bold text-[#EF4444]">
                    {formatCurrency(report.summary.mrrAtRisk)}
                  </span>
                  <span className="text-xs text-[#999]">/mo</span>
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-xs text-[#10B981] font-medium group-hover:text-[#34D399] transition">
                    View Report &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[#1A1A1A]">
          {reports.map((report) => {
            const date = new Date(report.scannedAt);
            const scoreBg = getScoreBg(report.summary.healthScore);

            return (
              <Link
                key={report.id}
                href={`/report/${report.id}`}
                className="block p-4 hover:bg-[#1A1A1A]/50 transition active:bg-[#1A1A1A]/70"
              >
                {/* Top row: date + score pill */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-[#999]">
                      {date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreBg}`}>
                    {report.summary.healthScore}/100
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-[#999]">MRR at Risk</p>
                    <p className="text-sm font-bold text-[#EF4444]">
                      {formatCurrency(report.summary.mrrAtRisk)}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Leaks</p>
                    <p className="text-sm font-bold text-white">
                      {report.summary.leaksFound}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs font-medium text-[#10B981]">
                      View &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
