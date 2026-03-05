"use client";

import { LeakCategorySummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

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
};

export default function LeakCategoryChart({
  categories,
}: LeakCategoryChartProps) {
  if (categories.length === 0) return null;

  const maxImpact = Math.max(...categories.map((c) => c.totalMonthlyImpact));

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        Revenue Leak Breakdown
      </h3>
      <div className="space-y-3">
        {categories.map((category) => {
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
                  <span className="text-sm text-[#ccc]">
                    {category.label}
                  </span>
                  <span className="text-xs text-[#999] bg-[#1A1A1A] px-1.5 py-0.5 rounded">
                    {category.count}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">
                  {formatCurrency(category.totalMonthlyImpact)}/mo
                </span>
              </div>
              <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color,
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
