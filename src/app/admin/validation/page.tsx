"use client";

import { useState } from "react";

interface Distribution {
  zero: number;
  oneTwo: number;
  threeFour: number;
  fiveSix: number;
  sevenPlus: number;
}

interface ConversionFunnel {
  totalProfiles: number;
  totalScans: number;
  freeUsers: number;
  paidUsers: number;
  planBreakdown: Record<string, number>;
}

interface TimelineEntry {
  date: string;
  scans: number;
}

interface ValidationStats {
  totalScans: number;
  scansWithLeaks: number;
  hitRate: number;
  avgLeakCount: number;
  avgLeakTypes: number;
  medianLeakTypes: number;
  avgMrrAtRisk: number;
  medianMrrAtRisk: number;
  scansOver500: number;
  scansOver500Rate: number;
  leakTypeBreakdown: Record<string, number>;
  topLeakTypes: { type: string; count: number; percentage: number }[];
  distribution: Distribution;
  conversionFunnel: ConversionFunnel;
  timeline: TimelineEntry[];
}

const LEAK_TYPE_LABELS: Record<string, string> = {
  expired_coupon: "Expired Coupons",
  never_expiring_discount: "Never-Expiring Discounts",
  failed_payment: "Uncollected Revenue",
  expiring_card: "Expiring Cards",
  ghost_subscription: "Ghost Subscriptions",
  stuck_subscription: "Stuck Subscriptions",
  legacy_pricing: "Legacy Pricing",
  missing_payment_method: "Missing Payment Methods",
  unbilled_overage: "Unbilled Overages",
  trial_expired: "Expired Trials",
  duplicate_subscription: "Duplicate Subscriptions",
  stale_coupon: "Stale Coupons",
  billing_churn: "Billing-Caused Churn",
};

export default function ValidationPage() {
  const [secret, setSecret] = useState("");
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchStats() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/validation-stats", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.status === 401) {
        setError("Invalid admin secret");
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }

  const formatCents = (cents: number) =>
    `$${Math.round(cents / 100).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-white mb-1">
          Validation Dashboard
        </h1>
        <p className="text-sm text-white/40 mb-8">
          Product-market fit metrics from real scans
        </p>

        {/* Auth */}
        <div className="flex gap-3 mb-10">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStats()}
            placeholder="Admin secret"
            className="flex-1 rounded-lg bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand/50"
          />
          <button
            onClick={fetchStats}
            disabled={loading || !secret}
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>

        {error && <p className="text-danger text-sm mb-6">{error}</p>}

        {stats && (
          <>
            {/* ─── Key Metrics ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total Scans"
                value={stats.totalScans.toString()}
              />
              <StatCard
                label="Hit Rate"
                value={`${stats.hitRate}%`}
                sub={`${stats.scansWithLeaks} found leaks`}
                color={
                  stats.hitRate >= 70
                    ? "text-brand"
                    : stats.hitRate >= 30
                      ? "text-warning"
                      : "text-danger"
                }
              />
              <StatCard
                label="Avg Leaks / Scan"
                value={stats.avgLeakCount.toString()}
              />
              <StatCard
                label="Avg MRR at Risk"
                value={formatCents(stats.avgMrrAtRisk)}
                sub={`Median: ${formatCents(stats.medianMrrAtRisk)}`}
              />
            </div>

            {/* ─── Leak Types Per Scan ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Avg Leak Types / Scan"
                value={stats.avgLeakTypes.toString()}
                sub="distinct types per report"
              />
              <StatCard
                label="Median Leak Types / Scan"
                value={stats.medianLeakTypes.toString()}
              />
              <StatCard
                label="Scans with $500+/mo"
                value={stats.scansOver500.toString()}
                sub={`${stats.scansOver500Rate}% of scans`}
              />
              <StatCard
                label="Scan Hit Rate"
                value={`${stats.hitRate}%`}
                sub="found at least 1 leak"
                color={stats.hitRate >= 50 ? "text-brand" : "text-warning"}
              />
            </div>

            {/* ─── Validation Signal ─── */}
            <div className="glass-card rounded-xl p-5 mb-6">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-3">
                Validation Signal
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full shrink-0 ${
                    stats.hitRate >= 70
                      ? "bg-brand"
                      : stats.hitRate >= 30
                        ? "bg-warning"
                        : "bg-danger"
                  }`}
                />
                <span className="text-white/70 text-sm">
                  {stats.hitRate >= 70
                    ? "GREEN -- Most scans find real leaks. Product validated."
                    : stats.hitRate >= 30
                      ? "YELLOW -- Some scans find leaks. Narrow focus to top leak types."
                      : stats.totalScans === 0
                        ? "NO DATA -- Need scans to validate."
                        : "RED -- Few scans find meaningful leaks. Consider pivot."}
                </span>
              </div>
            </div>

            {/* ─── Distribution Histogram ─── */}
            <div className="glass-card rounded-xl p-5 mb-6">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-4">
                Distribution: Leak Types Per Scan
              </div>
              <DistributionChart
                distribution={stats.distribution}
                totalScans={stats.totalScans}
              />
            </div>

            {/* ─── Most Common Leak Types ─── */}
            {stats.topLeakTypes.length > 0 && (
              <div className="glass-card rounded-xl p-5 mb-6">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-4">
                  Most Common Leak Types
                </div>
                <div className="space-y-3">
                  {stats.topLeakTypes.map((lt) => {
                    const maxCount = stats.topLeakTypes[0]?.count || 1;
                    const barWidth = Math.max(
                      8,
                      (lt.count / maxCount) * 100
                    );
                    return (
                      <div key={lt.type} className="flex items-center gap-3">
                        <span className="text-white/50 text-xs w-44 shrink-0 truncate">
                          {LEAK_TYPE_LABELS[lt.type] || lt.type.replace(/_/g, " ")}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div
                            className="h-5 rounded bg-brand/30 border border-brand/20 flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="text-[10px] text-white/70 font-mono">
                              {lt.count}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/30 w-10 text-right">
                            {lt.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Conversion Funnel ─── */}
            <div className="glass-card rounded-xl p-5 mb-6">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-4">
                Conversion Funnel
              </div>
              <ConversionFunnelChart funnel={stats.conversionFunnel} />
            </div>

            {/* ─── Scan Timeline ─── */}
            {stats.timeline.length > 0 && (
              <div className="glass-card rounded-xl p-5 mb-6">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-4">
                  Scans Per Day (last 30 days)
                </div>
                <TimelineChart timeline={stats.timeline} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="text-[10px] text-white/25 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

/* ─── Distribution Histogram ─── */
function DistributionChart({
  distribution,
  totalScans,
}: {
  distribution: Distribution;
  totalScans: number;
}) {
  const buckets = [
    { label: "0", value: distribution.zero },
    { label: "1-2", value: distribution.oneTwo },
    { label: "3-4", value: distribution.threeFour },
    { label: "5-6", value: distribution.fiveSix },
    { label: "7+", value: distribution.sevenPlus },
  ];

  const maxVal = Math.max(...buckets.map((b) => b.value), 1);

  return (
    <div className="flex items-end gap-3 h-40">
      {buckets.map((bucket) => {
        const height = Math.max(4, (bucket.value / maxVal) * 100);
        const pct =
          totalScans > 0
            ? Math.round((bucket.value / totalScans) * 100)
            : 0;
        return (
          <div
            key={bucket.label}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <span className="text-[10px] text-white/50 font-mono">
              {bucket.value}
            </span>
            <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
              <div
                className="w-full max-w-12 rounded-t bg-brand/40 border border-brand/20 transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[10px] text-white/40">{bucket.label}</span>
            <span className="text-[9px] text-white/20">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Conversion Funnel ─── */
function ConversionFunnelChart({ funnel }: { funnel: ConversionFunnel }) {
  const steps = [
    { label: "Signups", value: funnel.totalProfiles, color: "bg-white/20" },
    { label: "Ran Scan", value: funnel.totalScans, color: "bg-brand/40" },
    { label: "Paid", value: funnel.paidUsers, color: "bg-brand" },
  ];

  const maxVal = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="space-y-5">
      {/* Funnel bars */}
      <div className="space-y-3">
        {steps.map((step) => {
          const width = Math.max(4, (step.value / maxVal) * 100);
          return (
            <div key={step.label} className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-20 shrink-0">
                {step.label}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className={`h-7 rounded ${step.color} flex items-center pl-3 transition-all`}
                  style={{ width: `${width}%` }}
                >
                  <span className="text-xs font-semibold text-white">
                    {step.value}
                  </span>
                </div>
                {funnel.totalProfiles > 0 && (
                  <span className="text-[10px] text-white/25">
                    {Math.round((step.value / funnel.totalProfiles) * 100)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan breakdown */}
      {Object.keys(funnel.planBreakdown).length > 0 && (
        <div>
          <div className="text-[10px] text-white/20 uppercase tracking-wider mb-2">
            Plan Breakdown
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(funnel.planBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([plan, count]) => (
                <div
                  key={plan}
                  className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2"
                >
                  <span className="text-[10px] text-white/30 uppercase">
                    {plan}
                  </span>
                  <div className="text-sm font-semibold text-white">
                    {count}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Timeline Chart ─── */
function TimelineChart({ timeline }: { timeline: TimelineEntry[] }) {
  const maxScans = Math.max(...timeline.map((t) => t.scans), 1);

  return (
    <div className="flex items-end gap-1 h-28 overflow-x-auto">
      {timeline.map((entry) => {
        const height = Math.max(4, (entry.scans / maxScans) * 100);
        const dateLabel = entry.date.slice(5); // MM-DD
        return (
          <div
            key={entry.date}
            className="flex flex-col items-center gap-1 min-w-[20px] flex-1"
            title={`${entry.date}: ${entry.scans} scans`}
          >
            <span className="text-[9px] text-white/40 font-mono">
              {entry.scans}
            </span>
            <div
              className="w-full max-w-5 rounded-t bg-brand/50 transition-all"
              style={{ height: `${height}%` }}
            />
            <span className="text-[8px] text-white/20 -rotate-45 origin-top-left whitespace-nowrap">
              {dateLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
