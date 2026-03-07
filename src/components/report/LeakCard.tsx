"use client";

import { Leak, LeakType, LEAK_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, getSeverityColor } from "@/lib/utils";
import { useState } from "react";

// Leak types that have no automated recovery action — require human judgment
const ADVISORY_LEAK_TYPES: Set<LeakType> = new Set(["legacy_pricing"]);

interface LeakCardProps {
  leak: Leak;
}

export default function LeakCard({ leak }: LeakCardProps) {
  const [expanded, setExpanded] = useState(false);
  const severityColor = getSeverityColor(leak.severity);

  return (
    <div
      className="bg-surface border border-border border-l-2 rounded-xl overflow-hidden hover:border-border transition"
      style={{ borderLeftColor: severityColor }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left cursor-pointer"
        aria-expanded={expanded}
        aria-label={`${leak.title} — ${formatCurrency(leak.monthlyImpact)}/mo. Click to ${expanded ? "collapse" : "expand"} details`}
      >
        <div className="flex items-start gap-3">
          {/* Severity badge */}
          <span
            className="flex-shrink-0 px-2 py-0.5 text-xs font-bold uppercase rounded tracking-wider mt-0.5"
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
              <span className="flex-shrink-0 text-base font-bold text-danger">
                {formatCurrency(leak.monthlyImpact)}/mo
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-muted">
                {LEAK_TYPE_LABELS[leak.type]}
              </span>
              {ADVISORY_LEAK_TYPES.has(leak.type) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-info bg-info/10 border border-info/20 rounded">
                  Manual Review
                </span>
              )}
              {leak.customerEmail && (
                <>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted font-mono">
                    {leak.customerEmail}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Expand icon */}
          <svg
            className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform mt-1 ${
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

      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${
        expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 border-t border-border-light">
            <div className="mt-3 space-y-3">
            {/* Description */}
            <p className="text-sm text-text-muted leading-relaxed">
              {leak.description}
            </p>

            {/* Impact */}
            <div className="flex gap-4">
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3" style={{ boxShadow: "0 0 20px rgba(239, 68, 68, 0.08)" }}>
                <p className="text-xs text-danger uppercase tracking-wider">
                  Monthly Impact
                </p>
                <p className="text-base font-bold text-danger">
                  {formatCurrency(leak.monthlyImpact)}
                </p>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg px-4 py-3" style={{ boxShadow: "0 0 20px rgba(245, 158, 11, 0.08)" }}>
                <p className="text-xs text-warning uppercase tracking-wider">
                  Annual Impact
                </p>
                <p className="text-base font-bold text-warning">
                  {formatCurrency(leak.annualImpact)}
                </p>
              </div>
            </div>

            {/* Fix suggestion */}
            <div className="bg-brand/5 border border-brand/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
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
                  <p className="text-xs font-semibold text-brand mb-1">
                    How to fix
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {leak.fixSuggestion}
                  </p>
                  {(leak.platformUrl || leak.stripeUrl) && (
                    <a
                      href={leak.platformUrl || leak.stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-brand hover:text-brand-light transition"
                    >
                      View in Dashboard
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Advisory callout for leak types without automated recovery */}
            {ADVISORY_LEAK_TYPES.has(leak.type) && (
              <div className="bg-info/5 border border-info/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-info flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-info mb-1">
                      Why this requires manual review
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Price migrations are a business decision that affect
                      customer relationships. We recommend reviewing each case
                      individually before making changes.
                    </p>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
