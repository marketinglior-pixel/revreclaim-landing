"use client";

import { Leak } from "@/lib/types";
import { isActionableLeak } from "@/lib/leak-categories";
import { formatCurrency } from "@/lib/utils";

interface QuickWinsProps {
  leaks: Leak[];
}

export default function QuickWins({ leaks }: QuickWinsProps) {
  if (leaks.length === 0) return null;

  const quickFixes = leaks.filter(
    (l) => isActionableLeak(l.type) && l.recoveryRate >= 0.5
  );
  const needsReview = leaks.filter(
    (l) => !isActionableLeak(l.type) || l.recoveryRate < 0.5
  );

  const quickFixMRR = quickFixes.reduce(
    (sum, l) => sum + Math.round(l.monthlyImpact * l.recoveryRate),
    0
  );
  const reviewMRR = needsReview.reduce(
    (sum, l) => sum + Math.round(l.monthlyImpact * l.recoveryRate),
    0
  );

  if (quickFixes.length === 0 && needsReview.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
      {/* Quick Fixes */}
      {quickFixes.length > 0 && (
        <div className="bg-surface border border-brand/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
              <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Quick Fixes
              </h3>
              <p className="text-[10px] text-text-dim">High recovery likelihood</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-brand">
            {quickFixes.length}{" "}
            <span className="text-sm font-medium text-text-muted">
              fix{quickFixes.length !== 1 ? "es" : ""} → {formatCurrency(quickFixMRR)}/mo
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Array.from(new Set(quickFixes.map((l) => l.type))).map((type) => {
              const count = quickFixes.filter((l) => l.type === type).length;
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-brand/10 text-brand rounded border border-brand/20"
                >
                  {count}x {type.replace(/_/g, " ")}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Needs Review */}
      {needsReview.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
              <svg className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Needs Review
              </h3>
              <p className="text-[10px] text-text-dim">Business decision required</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-info">
            {needsReview.length}{" "}
            <span className="text-sm font-medium text-text-muted">
              item{needsReview.length !== 1 ? "s" : ""} → {formatCurrency(reviewMRR)}/mo
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Array.from(new Set(needsReview.map((l) => l.type))).map((type) => {
              const count = needsReview.filter((l) => l.type === type).length;
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/5 text-text-muted rounded border border-border"
                >
                  {count}x {type.replace(/_/g, " ")}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
