"use client";

import { useState } from "react";
import type { TrendPoint } from "@/lib/report-trends";
import { calculateChange } from "@/lib/report-trends";

type Metric = "healthScore" | "mrrAtRisk" | "leaksFound";

interface MetricConfig {
  key: Metric;
  label: string;
  format: (value: number) => string;
  color: string;
  /** For metrics where "up" is bad (e.g., MRR at risk), set true */
  invertDirection: boolean;
}

const METRICS: MetricConfig[] = [
  {
    key: "healthScore",
    label: "Health Score",
    format: (v) => `${v}`,
    color: "#10B981",
    invertDirection: false,
  },
  {
    key: "mrrAtRisk",
    label: "MRR at Risk",
    format: (v) => `$${(v / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    color: "#EF4444",
    invertDirection: true,
  },
  {
    key: "leaksFound",
    label: "Leaks Found",
    format: (v) => `${v}`,
    color: "#F59E0B",
    invertDirection: true,
  },
];

// SVG chart dimensions
const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const PADDING = { top: 20, right: 20, bottom: 30, left: 50 };
const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

function buildPath(
  points: TrendPoint[],
  metric: Metric,
  min: number,
  max: number
): string {
  if (points.length === 0) return "";
  const range = max - min || 1;

  return points
    .map((point, i) => {
      const x = PADDING.left + (i / Math.max(points.length - 1, 1)) * INNER_WIDTH;
      const y = PADDING.top + INNER_HEIGHT - ((point[metric] - min) / range) * INNER_HEIGHT;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(
  points: TrendPoint[],
  metric: Metric,
  min: number,
  max: number
): string {
  if (points.length === 0) return "";
  const range = max - min || 1;
  const linePath = points
    .map((point, i) => {
      const x = PADDING.left + (i / Math.max(points.length - 1, 1)) * INNER_WIDTH;
      const y = PADDING.top + INNER_HEIGHT - ((point[metric] - min) / range) * INNER_HEIGHT;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  // Close the area path
  const lastX = PADDING.left + INNER_WIDTH;
  const firstX = PADDING.left;
  const bottomY = PADDING.top + INNER_HEIGHT;

  return `${linePath} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
}

interface TrendChartProps {
  points: TrendPoint[];
}

export default function TrendChart({ points }: TrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<Metric>("healthScore");

  const config = METRICS.find((m) => m.key === activeMetric)!;
  const values = points.map((p) => p[activeMetric]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Add 10% padding to the range
  const rangePadding = (max - min) * 0.1 || 1;
  const chartMin = Math.max(0, min - rangePadding);
  const chartMax = max + rangePadding;

  const change = calculateChange(points, activeMetric);
  const isGood =
    change.direction === "flat" ||
    (config.invertDirection
      ? change.direction === "down"
      : change.direction === "up");

  // Grid lines (4 horizontal lines)
  const gridLines = Array.from({ length: 4 }, (_, i) => {
    const value = chartMin + ((chartMax - chartMin) * (3 - i)) / 3;
    const y = PADDING.top + (i / 3) * INNER_HEIGHT;
    return { value, y };
  });

  // X-axis labels — show up to 6 evenly spaced labels
  const maxLabels = Math.min(6, points.length);
  const labelIndices = Array.from({ length: maxLabels }, (_, i) =>
    Math.round((i / Math.max(maxLabels - 1, 1)) * (points.length - 1))
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Billing Health Trends</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Track your progress across {points.length} scan{points.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Metric toggle */}
        <div className="flex rounded-lg bg-surface-dim border border-border p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                activeMetric === m.key
                  ? "bg-surface-light text-white"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Change indicator */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-bold text-white">
          {config.format(values[values.length - 1])}
        </span>
        {change.direction !== "flat" && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isGood
                ? "bg-brand/10 text-brand"
                : "bg-danger/10 text-danger"
            }`}
          >
            <svg
              className={`w-3 h-3 ${change.direction === "down" ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {change.percentage}%
          </span>
        )}
        <span className="text-xs text-text-dim">vs. previous scan</span>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={line.y}
                x2={PADDING.left + INNER_WIDTH}
                y2={line.y}
                stroke="#2A2A2A"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={line.y + 4}
                textAnchor="end"
                fill="#666"
                fontSize={10}
                fontFamily="system-ui"
              >
                {config.format(Math.round(line.value))}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {labelIndices.map((idx) => {
            const x = PADDING.left + (idx / Math.max(points.length - 1, 1)) * INNER_WIDTH;
            return (
              <text
                key={idx}
                x={x}
                y={CHART_HEIGHT - 5}
                textAnchor="middle"
                fill="#666"
                fontSize={10}
                fontFamily="system-ui"
              >
                {points[idx].label}
              </text>
            );
          })}

          {/* Area fill */}
          <path
            d={buildAreaPath(points, activeMetric, chartMin, chartMax)}
            fill={config.color}
            fillOpacity={0.08}
          />

          {/* Line */}
          <path
            d={buildPath(points, activeMetric, chartMin, chartMax)}
            fill="none"
            stroke={config.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, i) => {
            const x = PADDING.left + (i / Math.max(points.length - 1, 1)) * INNER_WIDTH;
            const range = chartMax - chartMin || 1;
            const y =
              PADDING.top +
              INNER_HEIGHT -
              ((point[activeMetric] - chartMin) / range) * INNER_HEIGHT;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={4} fill="#111111" stroke={config.color} strokeWidth={2} />
                {/* Tooltip on hover — just show value as title */}
                <title>
                  {point.label}: {config.format(point[activeMetric])}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
