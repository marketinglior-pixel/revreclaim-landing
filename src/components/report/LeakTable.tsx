"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Leak, LeakSeverity, LeakType, LEAK_TYPE_LABELS } from "@/lib/types";
import { isActionableLeak } from "@/lib/leak-categories";
import LeakCard from "./LeakCard";

interface LeakTableProps {
  leaks: Leak[];
  isLoggedIn?: boolean;
  isPaidUser?: boolean;
  isDemo?: boolean;
  onDismiss?: (customerId: string, leakType: string) => void;
  privacyMode?: boolean;
}

const SEVERITY_FILTERS: { label: string; value: LeakSeverity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

type ActionFilter = "action" | "review" | "all";

export default function LeakTable({ leaks, isLoggedIn, isPaidUser, isDemo, onDismiss, privacyMode }: LeakTableProps) {
  const pathname = usePathname();
  const [severityFilter, setSeverityFilter] = useState<
    LeakSeverity | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<LeakType | "all">("all");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("action");
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 10;

  const actionableCount = leaks.filter((l) => isActionableLeak(l.type)).length;
  const reviewCount = leaks.filter((l) => !isActionableLeak(l.type)).length;

  const filteredLeaks = leaks.filter((leak) => {
    if (actionFilter === "action" && !isActionableLeak(leak.type)) return false;
    if (actionFilter === "review" && isActionableLeak(leak.type)) return false;
    if (severityFilter !== "all" && leak.severity !== severityFilter)
      return false;
    if (typeFilter !== "all" && leak.type !== typeFilter) return false;
    return true;
  });

  // Get unique types that exist in currently filtered leaks (by action filter)
  const visibleLeaks = leaks.filter((leak) => {
    if (actionFilter === "action" && !isActionableLeak(leak.type)) return false;
    if (actionFilter === "review" && isActionableLeak(leak.type)) return false;
    return true;
  });
  const existingTypes = Array.from(new Set(visibleLeaks.map((l) => l.type)));

  const ACTION_TABS: { label: string; value: ActionFilter; count: number }[] = [
    { label: "Needs Action", value: "action", count: actionableCount },
    { label: "For Review", value: "review", count: reviewCount },
    { label: "All Leaks", value: "all", count: leaks.length },
  ];

  return (
    <div>
      {/* Action / Review tabs */}
      {reviewCount > 0 && (
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 mb-4">
          {ACTION_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActionFilter(tab.value);
                setTypeFilter("all");
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md transition cursor-pointer ${
                actionFilter === tab.value
                  ? "bg-surface-lighter text-white font-medium"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {tab.value === "action" && <span className="w-2 h-2 rounded-full bg-danger" />}
              {tab.value === "review" && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              )}
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                actionFilter === tab.value
                  ? "bg-brand/20 text-brand"
                  : "bg-surface-light text-text-muted"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white">
          {actionFilter === "action"
            ? `Start here (${filteredLeaks.length})`
            : actionFilter === "review"
              ? `For Review (${filteredLeaks.length})`
              : `All Leaks (${filteredLeaks.length})`}
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* Severity filter */}
          <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
            {SEVERITY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSeverityFilter(filter.value)}
                className={`px-2.5 py-1 text-xs rounded-md transition cursor-pointer ${
                  severityFilter === filter.value
                    ? "bg-surface-lighter text-white font-medium"
                    : "text-text-muted hover:text-text-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          {existingTypes.length > 1 && (
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as LeakType | "all")
              }
              className="px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text-secondary focus:border-brand focus:outline-none"
            >
              <option value="all">All Types</option>
              {existingTypes.map((type) => (
                <option key={type} value={type}>
                  {LEAK_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Leak cards */}
      <div className="space-y-2">
        {filteredLeaks.length > 0 ? (
          <>
            {filteredLeaks.slice(0, isPaidUser || isDemo ? (showAll ? filteredLeaks.length : INITIAL_LIMIT) : 3).map((leak) => (
              <LeakCard key={leak.id} leak={leak} isLoggedIn={isLoggedIn} isPaidUser={isPaidUser} isDemo={isDemo} onDismiss={onDismiss} privacyMode={privacyMode} />
            ))}
            {/* Show all button for paid/demo users */}
            {(isPaidUser || isDemo) && !showAll && filteredLeaks.length > INITIAL_LIMIT && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 text-sm text-brand hover:text-brand-light bg-surface border border-border rounded-xl transition cursor-pointer"
              >
                Show all {filteredLeaks.length} leaks ({filteredLeaks.length - INITIAL_LIMIT} more)
              </button>
            )}
            {/* Gate remaining leaks for free users */}
            {!isPaidUser && !isDemo && filteredLeaks.length > 3 && (
              <div className="relative">
                {/* Blurred preview of next leak */}
                <div className="blur-[6px] opacity-50 pointer-events-none select-none" aria-hidden="true">
                  <LeakCard leak={filteredLeaks[3]} isLoggedIn={false} privacyMode={privacyMode} />
                </div>
                {/* Gate overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm rounded-xl border border-brand/20">
                  <div className="text-center px-6 py-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <span className="text-sm font-bold text-white">
                        {filteredLeaks.length - 3} more leak{filteredLeaks.length - 3 !== 1 ? "s" : ""} worth ${Math.round(filteredLeaks.slice(3).reduce((sum, l) => sum + l.monthlyImpact, 0) / 100).toLocaleString()}/mo
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-3">
                      Upgrade to see all leaks with fix links and activate auto-fix.
                    </p>
                    <a
                      href={isLoggedIn ? "/#pricing" : `/auth/signup?redirect=${encodeURIComponent(pathname)}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-black hover:bg-brand-light transition"
                    >
                      {isLoggedIn ? "Upgrade to See All Leaks" : "Sign Up Free to See All Leaks"}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <p className="text-text-muted">
              {leaks.length === 0
                ? "No revenue leaks found. Your billing is clean."
                : actionFilter === "action"
                  ? "No actionable leaks found. Check the 'For Review' tab for items to review."
                  : actionFilter === "review"
                    ? "No items for review."
                    : "No leaks match the current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
