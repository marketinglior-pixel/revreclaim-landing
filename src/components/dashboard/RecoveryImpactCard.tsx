"use client";

import { useEffect, useState } from "react";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface RecentAction {
  id: string;
  actionType: string;
  customerId: string;
  monthlyImpact: number;
  executedAt: string | null;
}

interface RecoveryStats {
  totalRecoveredMonthly: number;
  totalRecoveredAnnual: number;
  recoveryRate: number;
  totalExecuted: number;
  totalRecovered: number;
  totalStillOpen: number;
  roi: number;
  recentActions: RecentAction[];
}

const ACTION_LABELS: Record<string, string> = {
  send_dunning_email: "Payment reminder sent",
  retry_payment: "Payment retried",
  remove_coupon: "Coupon removed",
  cancel_subscription: "Ghost sub cancelled",
};

export default function RecoveryImpactCard() {
  const [stats, setStats] = useState<RecoveryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/recovery-stats");
        if (res.ok) {
          const data = await res.json();
          // Only show if there are executed actions
          if (data.totalExecuted > 0) {
            setStats(data);
          }
        }
      } catch {
        // Silently fail — card just won't render
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Animated numbers
  const animatedRecovered = useAnimatedNumber(
    stats ? Math.round(stats.totalRecoveredMonthly / 100) : 0,
    1500,
    300
  );
  const animatedAnnual = useAnimatedNumber(
    stats ? Math.round(stats.totalRecoveredAnnual / 100) : 0,
    1500,
    500
  );
  const animatedRate = useAnimatedNumber(
    stats?.recoveryRate || 0,
    1000,
    700
  );

  if (loading || !stats) return null;

  const rateColor =
    stats.recoveryRate >= 70
      ? "text-brand"
      : stats.recoveryRate >= 40
        ? "text-warning"
        : "text-danger";

  return (
    <div className="animate-fade-in-up rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent p-6 md:p-8">
      {/* Top label */}
      <div className="mb-1 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-brand"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Revenue Recovered
        </span>
        {stats.roi > 0 && (
          <span className="ml-auto rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-bold text-brand">
            {stats.roi}x ROI
          </span>
        )}
      </div>

      {/* Big number */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            ${animatedRecovered.toLocaleString()}
          </span>
          <span className="text-lg font-medium text-brand md:text-xl">
            /mo recovered
          </span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          ${animatedAnnual.toLocaleString()}/year projected •{" "}
          {stats.totalRecovered} of {stats.totalExecuted} actions confirmed
          recovered
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        {/* Recovery Rate */}
        <div className="rounded-xl border border-border bg-surface-dim p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Recovery Rate
          </p>
          <p className={`mt-1 text-lg font-bold md:text-xl ${rateColor}`}>
            {animatedRate}%
          </p>
        </div>

        {/* Recovered */}
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Recovered
          </p>
          <p className="mt-1 text-lg font-bold text-brand md:text-xl">
            {stats.totalRecovered}
            <span className="text-xs font-normal text-text-muted"> actions</span>
          </p>
        </div>

        {/* Still Open */}
        <div className="rounded-xl border border-border bg-surface-dim p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Still Open
          </p>
          <p className="mt-1 text-lg font-bold text-warning md:text-xl">
            {stats.totalStillOpen}
            <span className="text-xs font-normal text-text-muted"> pending</span>
          </p>
        </div>
      </div>

      {/* Recent recovered timeline */}
      {stats.recentActions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Recent Activity
          </p>
          <div className="space-y-2">
            {stats.recentActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-3 rounded-lg bg-surface-dim/50 px-3 py-2 text-sm"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15">
                  <svg
                    className="h-3 w-3 text-brand"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-text-muted">
                    {ACTION_LABELS[action.actionType] || action.actionType}
                  </span>
                  <span className="text-text-dim"> · </span>
                  <span className="text-white font-medium">
                    ${(action.monthlyImpact / 100).toLocaleString()}/mo
                  </span>
                </div>
                {action.executedAt && (
                  <span className="shrink-0 text-xs text-text-dim">
                    {formatRelativeTime(action.executedAt)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
