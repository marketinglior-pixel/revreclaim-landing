"use client";

import { useState } from "react";

interface ValidationStats {
  totalScans: number;
  scansWithLeaks: number;
  hitRate: number;
  avgLeakCount: number;
  avgMrrAtRisk: number;
  scansOver500: number;
  scansOver500Rate: number;
  leakTypeBreakdown: Record<string, number>;
  topLeakTypes: { type: string; count: number }[];
}

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

  const formatCents = (cents: number) => {
    return `$${Math.round(cents / 100).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-2">
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

        {error && (
          <p className="text-danger text-sm mb-6">{error}</p>
        )}

        {stats && (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card
                label="Total Scans"
                value={stats.totalScans.toString()}
              />
              <Card
                label="Hit Rate"
                value={`${stats.hitRate}%`}
                sub={`${stats.scansWithLeaks} found leaks`}
                color={stats.hitRate >= 70 ? "text-brand" : stats.hitRate >= 30 ? "text-warning" : "text-danger"}
              />
              <Card
                label="Avg Leaks/Scan"
                value={stats.avgLeakCount.toString()}
              />
              <Card
                label="Avg MRR at Risk"
                value={formatCents(stats.avgMrrAtRisk)}
              />
            </div>

            {/* Validation signal */}
            <div className="glass-card rounded-xl p-5 mb-8">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-3">
                Validation Signal
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${
                    stats.hitRate >= 70
                      ? "bg-brand"
                      : stats.hitRate >= 30
                        ? "bg-warning"
                        : "bg-danger"
                  }`}
                />
                <span className="text-white/70 text-sm">
                  {stats.hitRate >= 70
                    ? "GREEN — Most scans find real leaks. Product validated."
                    : stats.hitRate >= 30
                      ? "YELLOW — Some scans find leaks. Narrow focus to top leak types."
                      : stats.totalScans === 0
                        ? "NO DATA — Need scans to validate."
                        : "RED — Few scans find meaningful leaks. Consider pivot."}
                </span>
              </div>
              <div className="mt-3 text-xs text-white/25">
                Scans with $500+/mo at risk: {stats.scansOver500} ({stats.scansOver500Rate}%)
              </div>
            </div>

            {/* Leak type breakdown */}
            {stats.topLeakTypes.length > 0 && (
              <div className="glass-card rounded-xl p-5">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-4">
                  Leak Types Found (most common first)
                </div>
                <div className="space-y-2">
                  {stats.topLeakTypes.map((lt) => (
                    <div
                      key={lt.type}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/60 font-mono text-xs">
                        {lt.type.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-1.5 rounded-full bg-brand/50"
                          style={{
                            width: `${Math.max(20, (lt.count / (stats.topLeakTypes[0]?.count || 1)) * 120)}px`,
                          }}
                        />
                        <span className="text-white/40 text-xs w-8 text-right">
                          {lt.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Card({
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
