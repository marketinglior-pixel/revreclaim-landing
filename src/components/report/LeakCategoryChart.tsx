"use client";

import { useEffect, useState } from "react";
import { LeakCategorySummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { isActionableLeak } from "@/lib/leak-categories";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface LeakCategoryChartProps {
  categories: LeakCategorySummary[];
}

const CATEGORY_COLORS: Record<string, string> = {
  failed_payment: "#EF4444",
  ghost_subscription: "#F97316",
  expiring_card: "#F59E0B",
  missing_payment_method: "#EC4899",
  expired_coupon: "#8B5CF6",
  never_expiring_discount: "#6366F1",
  legacy_pricing: "#3B82F6",
  unbilled_overage: "#14B8A6",
  trial_expired: "#A78BFA",
  duplicate_subscription: "#F472B6",
};

export default function LeakCategoryChart({
  categories,
}: LeakCategoryChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    // Small delay to trigger entry animation
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const shouldAnimate = animate || prefersReducedMotion;

  if (categories.length === 0) return null;

  const maxImpact = Math.max(...categories.map((c) => c.totalMonthlyImpact));

  return (
    <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in-up animate-delay-200">
      <h3 className="text-sm font-semibold text-white mb-4">
        Revenue Leak Breakdown
      </h3>
      <div className="space-y-3">
        {categories.map((category, i) => {
          const color = CATEGORY_COLORS[category.type] || "#6B7280";
          const barWidth =
            maxImpact > 0
              ? Math.max(
                  4,
                  (category.totalMonthlyImpact / maxImpact) * 100
                )
              : 0;

          return (
            <div key={category.type}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-text-secondary">
                    {category.label}
                  </span>
                  {!isActionableLeak(category.type) && (
                    <span className="text-[10px] text-info bg-info/10 border border-info/20 px-1.5 py-0.5 rounded font-medium">
                      For Review
                    </span>
                  )}
                  <span className="text-xs text-text-muted bg-surface-light px-1.5 py-0.5 rounded">
                    {category.count}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {formatCurrency(category.totalMonthlyImpact)}/mo
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-light rounded-full overflow-hidden group">
                <div
                  className={`h-full rounded-full hover:brightness-125 ${prefersReducedMotion ? "" : "transition-all duration-700 ease-out"}`}
                  style={{
                    width: shouldAnimate ? `${barWidth}%` : "0%",
                    backgroundColor: color,
                    transitionDelay: prefersReducedMotion ? "0ms" : `${i * 120}ms`,
                    boxShadow: shouldAnimate ? `0 0 8px ${color}40` : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
