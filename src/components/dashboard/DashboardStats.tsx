import { ScanReport } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function DashboardStats({ report }: { report: ScanReport }) {
  const { summary } = report;

  const scoreColor =
    summary.healthScore >= 80
      ? "text-[#10B981]"
      : summary.healthScore >= 60
        ? "text-[#F59E0B]"
        : summary.healthScore >= 40
          ? "text-[#F97316]"
          : "text-[#EF4444]";

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Health Score */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-2">
          <svg width="64" height="64" className="transform -rotate-90">
            <circle
              cx="32" cy="32" r="28"
              fill="none" stroke="#1A1A1A" strokeWidth="6"
            />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke={
                summary.healthScore >= 80 ? "#10B981" :
                summary.healthScore >= 60 ? "#F59E0B" :
                summary.healthScore >= 40 ? "#F97316" : "#EF4444"
              }
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${175.9 * (summary.healthScore / 100)} 175.9`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${scoreColor}`}>
              {summary.healthScore}
            </span>
          </div>
        </div>
        <div className="text-xs text-[#666]">Health Score</div>
      </div>

      {/* MRR at Risk */}
      <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-5">
        <div className="mb-1 text-xs text-[#666]">MRR at Risk</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#EF4444]">
            {formatCurrency(summary.mrrAtRisk)}
          </span>
          <span className="text-sm text-[#666]">/mo</span>
        </div>
      </div>

      {/* Leaks Found */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5">
        <div className="mb-1 text-xs text-[#666]">Leaks Found</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">
            {summary.leaksFound}
          </span>
          <span className="text-sm text-[#666]">issues</span>
        </div>
      </div>

      {/* Annual Recovery */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5">
        <div className="mb-1 text-xs text-[#666]">Annual Recovery</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#10B981]">
            {formatCurrency(summary.recoveryPotential)}
          </span>
          <span className="text-sm text-[#666]">/yr</span>
        </div>
      </div>
    </div>
  );
}
