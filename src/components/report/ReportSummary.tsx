"use client";

import { ScanSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import HealthScore from "./HealthScore";

interface ReportSummaryProps {
  summary: ScanSummary;
}

export default function ReportSummary({ summary }: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Health Score - spans 1 col */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 flex items-center justify-center lg:col-span-1">
        <HealthScore score={summary.healthScore} />
      </div>

      {/* Stats grid - spans 4 cols */}
      <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="MRR at Risk"
          value={formatCurrency(summary.mrrAtRisk)}
          suffix="/mo"
          color="#EF4444"
          description={`${((summary.mrrAtRisk / Math.max(summary.totalMRR, 1)) * 100).toFixed(1)}% of your MRR`}
        />
        <StatCard
          label="Leaks Found"
          value={String(summary.leaksFound)}
          color={summary.leaksFound > 0 ? "#F59E0B" : "#10B981"}
          description={`Across ${summary.totalSubscriptions} subscriptions`}
        />
        <StatCard
          label="Annual Recovery"
          value={formatCurrency(summary.recoveryPotential)}
          suffix="/yr"
          color="#10B981"
          description="Potential revenue to recover"
        />
        <StatCard
          label="Total MRR"
          value={formatCurrency(summary.totalMRR)}
          suffix="/mo"
          color="#3B82F6"
          description={`${summary.totalCustomers} customers`}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  color,
  description,
}: {
  label: string;
  value: string;
  suffix?: string;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
      <p className="text-xs text-[#666] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
        {suffix && (
          <span className="text-sm font-normal text-[#666]">{suffix}</span>
        )}
      </p>
      <p className="text-xs text-[#666] mt-1">{description}</p>
    </div>
  );
}
