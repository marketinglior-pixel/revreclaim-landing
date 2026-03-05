"use client";

import { Leak, LEAK_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, getSeverityColor } from "@/lib/utils";
import { useState } from "react";

interface LeakCardProps {
  leak: Leak;
}

export default function LeakCard({ leak }: LeakCardProps) {
  const [expanded, setExpanded] = useState(false);
  const severityColor = getSeverityColor(leak.severity);

  return (
    <div
      className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#3A3A3A] transition"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left cursor-pointer"
      >
        <div className="flex items-start gap-3">
          {/* Severity badge */}
          <span
            className="flex-shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider mt-0.5"
            style={{
              backgroundColor: `${severityColor}15`,
              color: severityColor,
              border: `1px solid ${severityColor}30`,
            }}
          >
            {leak.severity}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-white leading-tight">
                {leak.title}
              </h4>
              <span className="flex-shrink-0 text-sm font-bold text-[#EF4444]">
                {formatCurrency(leak.monthlyImpact)}/mo
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[#666]">
                {LEAK_TYPE_LABELS[leak.type]}
              </span>
              {leak.customerEmail && (
                <>
                  <span className="text-xs text-[#333]">·</span>
                  <span className="text-xs text-[#666] font-mono">
                    {leak.customerEmail}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Expand icon */}
          <svg
            className={`w-4 h-4 text-[#666] flex-shrink-0 transition-transform mt-1 ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[#1A1A1A]">
          <div className="mt-3 space-y-3">
            {/* Description */}
            <p className="text-sm text-[#999] leading-relaxed">
              {leak.description}
            </p>

            {/* Impact */}
            <div className="flex gap-4">
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-3 py-2">
                <p className="text-[10px] text-[#EF4444] uppercase tracking-wider">
                  Monthly Impact
                </p>
                <p className="text-sm font-bold text-[#EF4444]">
                  {formatCurrency(leak.monthlyImpact)}
                </p>
              </div>
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg px-3 py-2">
                <p className="text-[10px] text-[#F59E0B] uppercase tracking-wider">
                  Annual Impact
                </p>
                <p className="text-sm font-bold text-[#F59E0B]">
                  {formatCurrency(leak.annualImpact)}
                </p>
              </div>
            </div>

            {/* Fix suggestion */}
            <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-[#10B981] mb-1">
                    How to fix
                  </p>
                  <p className="text-xs text-[#999] leading-relaxed">
                    {leak.fixSuggestion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
