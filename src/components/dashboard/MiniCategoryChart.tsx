"use client";

import { useEffect, useState } from "react";
import { LeakCategorySummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  failed_payment: "#EF4444",
  stuck_subscription: "#F97316",
  expiring_card: "#F59E0B",
  missing_payment_method: "#EC4899",
  expired_coupon: "#8B5CF6",
  never_expiring_discount: "#6366F1",
  legacy_pricing: "#3B82F6",
};

export default function MiniCategoryChart({
  categories,
  reportId,
}: {
  categories: LeakCategorySummary[];
  reportId: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [animate, setAnimate] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  if (categories.length === 0) return null;

  // Show top 4 categories sorted by impact
  const topCategories = [...categories]
    .sort((a, b) => b.totalMonthlyImpact - a.totalMonthlyImpact)
    .slice(0, 4);

  const maxImpact = Math.max(...topCategories.map((c) => c.totalMonthlyImpact));

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 animate-fade-in-up animate-delay-300">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Top Leak Categories</h3>
        <Link
          href={`/report/${reportId}`}
          className="text-xs font-medium text-brand hover:text-brand-light transition"
        >
          View full report &rarr;
        </Link>
      </div>

      <div className="space-y-3">
        {topCategories.map((category, i) => {
          const color = CATEGORY_COLORS[category.type] || "#6B7280";
          const barWidth =
            maxImpact > 0
              ? Math.max(4, (category.totalMonthlyImpact / maxImpact) * 100)
              : 0;

          return (
            <div key={category.type}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-text-secondary">{category.label}</span>
                  <span className="rounded bg-surface-light px-1.5 py-0.5 text-xs text-text-muted">
                    {category.count}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {formatCurrency(category.totalMonthlyImpact)}/mo
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-light">
                <div
                  className={`h-full rounded-full ${prefersReducedMotion ? "" : "transition-all duration-700 ease-out"}`}
                  style={{
                    width: animate ? `${barWidth}%` : "0%",
                    backgroundColor: color,
                    transitionDelay: prefersReducedMotion ? "0ms" : `${i * 150}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {categories.length > 4 && (
        <p className="mt-3 text-center text-xs text-text-muted">
          + {categories.length - 4} more categor{categories.length - 4 === 1 ? "y" : "ies"}
        </p>
      )}
    </div>
  );
}
