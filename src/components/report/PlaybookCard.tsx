"use client";

import { useState } from "react";
import type { Playbook } from "@/lib/recovery/playbooks";
import { LEAK_TYPE_LABELS } from "@/lib/types";

interface PlaybookCardProps {
  playbook: Playbook;
  matchingLeakCount: number;
}

export default function PlaybookCard({
  playbook,
  matchingLeakCount,
}: PlaybookCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 hover:bg-surface-dim transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">{playbook.title}</h3>
            <p className="text-sm text-text-muted mt-1">{playbook.subtitle}</p>

            {/* Leak type badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {playbook.leakTypes.map((lt) => (
                <span
                  key={lt}
                  className="rounded-full bg-surface-light px-2.5 py-0.5 text-[10px] font-medium text-text-muted"
                >
                  {LEAK_TYPE_LABELS[lt]}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Stats */}
            <div className="text-right hidden sm:block">
              <div className="text-xs text-text-dim">{playbook.estimatedTime}</div>
              <div className="text-xs text-brand font-semibold">
                {playbook.expectedRecoveryRate} recovery
              </div>
            </div>

            {/* Matching leak count badge */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
              {matchingLeakCount}
            </div>

            {/* Expand arrow */}
            <svg
              className={`h-5 w-5 text-text-muted transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Steps — expandable */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5">
          <div className="mt-4 space-y-4">
            {playbook.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {step.why}
                  </p>
                  <div className="mt-2 rounded-lg bg-surface-dim border border-border-light p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-brand mb-1">
                      How RevReclaim helps
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {step.howRevReclaim}
                    </p>
                  </div>
                  <p className="text-xs text-brand/70 mt-2">
                    Expected: {step.expectedOutcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
