"use client";

import Link from "next/link";

interface ReportCTAProps {
  mrrAtRisk: number;
}

export default function ReportCTA({ mrrAtRisk }: ReportCTAProps) {
  const annualRisk = (mrrAtRisk * 12) / 100;

  return (
    <div className="bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 border border-[#10B981]/20 rounded-xl p-8 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full mb-4">
        <span className="w-2 h-2 bg-[#10B981] rounded-full" />
        <span className="text-xs font-medium text-[#10B981]">
          Coming Soon
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        Want Continuous Monitoring?
      </h3>
      <p className="text-[#999] max-w-md mx-auto mb-6">
        {annualRisk > 0
          ? `You're at risk of losing $${annualRisk.toLocaleString()}/year. Get weekly scans with automated alerts so you catch leaks before they cost you.`
          : "Your billing looks great! Get weekly scans to make sure it stays that way."}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/#pricing"
          className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition"
        >
          View Pricing Plans
        </Link>
        <Link
          href="/scan"
          className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#222222] text-white font-medium rounded-lg border border-[#2A2A2A] transition"
        >
          Run Another Scan
        </Link>
      </div>
    </div>
  );
}
