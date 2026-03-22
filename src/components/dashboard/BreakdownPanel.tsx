"use client";

import { ScanReport, LEAK_TYPE_LABELS } from "@/lib/types";
import Link from "next/link";

interface BreakdownPanelProps {
  report: ScanReport | null;
}

export default function BreakdownPanel({ report }: BreakdownPanelProps) {
  if (!report) return null;

  // Group leaks by type and sum impact
  const leaksByType = report.leaks.reduce<Record<string, { count: number; impact: number }>>((acc, leak) => {
    const type = leak.type;
    if (!acc[type]) acc[type] = { count: 0, impact: 0 };
    acc[type].count++;
    acc[type].impact += leak.monthlyImpact ?? 0;
    return acc;
  }, {});

  const sortedTypes = Object.entries(leaksByType)
    .sort(([, a], [, b]) => b.impact - a.impact)
    .slice(0, 8);

  const topLeaks = [...report.leaks]
    .sort((a, b) => (b.monthlyImpact ?? 0) - (a.monthlyImpact ?? 0))
    .slice(0, 5);

  return (
    <aside className="hidden xl:block w-72 bg-surface border-l border-white/[0.06] h-screen sticky top-0 overflow-y-auto shrink-0">
      {/* Leak Types Breakdown */}
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3">
          Leak Types
        </h3>
        <div className="space-y-2">
          {sortedTypes.map(([type, data]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                <span className="text-xs text-text-muted truncate">
                  {LEAK_TYPE_LABELS[type as keyof typeof LEAK_TYPE_LABELS] || type}
                </span>
                <span className="text-[10px] text-text-dim">{data.count}</span>
              </div>
              <span className="text-xs font-medium text-danger shrink-0 ml-2">
                ${Math.round(data.impact / 100).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-text-dim">Total at risk</span>
          <span className="text-sm font-bold text-danger">
            ${Math.round(report.summary.mrrAtRisk / 100).toLocaleString()}/mo
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3">
          Activity
        </h3>
        <div className="space-y-3">
          {topLeaks.map((leak, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                leak.severity === "critical" || leak.severity === "high"
                  ? "bg-danger"
                  : "bg-danger/50"
              }`} />
              <div className="min-w-0">
                <p className="text-xs text-text-muted leading-snug truncate">
                  {leak.description?.slice(0, 50) || leak.type}
                </p>
                <p className="text-[10px] text-danger font-medium">
                  ${Math.round((leak.monthlyImpact ?? 0) / 100).toLocaleString()}/mo
                </p>
              </div>
            </div>
          ))}
        </div>
        {report.leaks.length > 5 && (
          <Link
            href={`/report/${report.id}`}
            className="mt-3 inline-flex items-center gap-1 text-xs text-brand hover:text-brand-light transition"
          >
            View all {report.leaks.length}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </aside>
  );
}
