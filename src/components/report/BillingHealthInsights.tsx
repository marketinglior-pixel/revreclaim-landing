"use client";

import { BillingHealthInsights as BillingHealthInsightsType } from "@/lib/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect, useState } from "react";

interface BillingHealthInsightsProps {
  billingHealth: BillingHealthInsightsType;
}

const STATUS_CONFIG = {
  healthy: { color: "#10B981", bg: "bg-success/10", border: "border-success/20", label: "Healthy" },
  warning: { color: "#F59E0B", bg: "bg-warning/10", border: "border-warning/20", label: "Needs Work" },
  danger: { color: "#EF4444", bg: "bg-danger/10", border: "border-danger/20", label: "At Risk" },
} as const;

const GRADE_COLORS: Record<string, string> = {
  A: "#10B981",
  B: "#34D399",
  C: "#F59E0B",
  D: "#F97316",
  F: "#EF4444",
};

const INSIGHT_ICONS: Record<string, string> = {
  payment_health: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM2 10h20",
  discount_hygiene: "M10 3H5a2 2 0 0 0-2 2v5l10.5 10.5a2 2 0 0 0 2.83 0l4.17-4.17a2 2 0 0 0 0-2.83L10 3ZM7 7h.01",
  price_freshness: "M3 7l5 5 4-4 9 9M17 17h4v-4",
  subscription_integrity: "M12 2a7 7 0 0 0-7 7v11l2.5-2 2.5 2 2-2 2 2 2.5-2L19 20V9a7 7 0 0 0-7-7Z",
  churn_risk: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM12 9v4M12 17h.01",
  revenue_capture: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  customer_engagement: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

function InsightIcon({ id, color }: { id: string; color: string }) {
  const pathData = INSIGHT_ICONS[id] || "";
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {pathData.split(/(?=[A-Z])/).length > 1 ? (
        // Multiple path commands — split on M for separate paths
        pathData.split(/(?=M)/).map((d, i) => <path key={i} d={d} />)
      ) : (
        <path d={pathData} />
      )}
    </svg>
  );
}

function MiniGauge({
  score,
  color,
  animate,
}: {
  score: number;
  color: string;
  animate: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const width = 48;
  const height = 28;
  const strokeWidth = 4;
  const radius = 20;
  // Semi-circle arc
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={width} height={height} viewBox="0 0 48 28">
      {/* Background arc */}
      <path
        d="M4 26 A 20 20 0 0 1 44 26"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Score arc */}
      <path
        d="M4 26 A 20 20 0 0 1 44 26"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={animate ? offset : circumference}
        className={prefersReducedMotion ? "" : "transition-all duration-1000 ease-out"}
      />
    </svg>
  );
}

export default function BillingHealthInsights({
  billingHealth,
}: BillingHealthInsightsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const shouldAnimate = animate || prefersReducedMotion;

  const gradeColor = GRADE_COLORS[billingHealth.overallGrade] || "#6B7280";

  return (
    <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in-up animate-delay-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Billing Health Breakdown
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {billingHealth.insights.length} dimensions of your billing infrastructure health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Overall:</span>
          <span
            className="text-2xl font-bold leading-none"
            style={{ color: gradeColor }}
          >
            {billingHealth.overallGrade}
          </span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {billingHealth.insights.map((insight, i) => {
          const config = STATUS_CONFIG[insight.status];
          return (
            <div
              key={insight.id}
              className={`rounded-lg border ${config.border} ${config.bg} p-4 ${
                prefersReducedMotion ? "" : "animate-fade-in-up"
              }`}
              style={{
                animationDelay: prefersReducedMotion ? "0ms" : `${i * 80}ms`,
              }}
            >
              {/* Top row: icon + label + gauge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <InsightIcon id={insight.id} color={config.color} />
                  <span className="text-sm font-semibold text-white">
                    {insight.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MiniGauge
                    score={insight.score}
                    color={config.color}
                    animate={shouldAnimate}
                  />
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: config.color }}
                  >
                    {insight.score}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-text-dim mb-2">
                {insight.description}
              </p>

              {/* Detail / finding */}
              <p className="text-xs text-text-muted leading-relaxed">
                {insight.detail}
              </p>

              {/* Status badge */}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} border ${config.border}`}
                  style={{ color: config.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
