"use client";

import { useState } from "react";
import { Leak, LeakSeverity, LeakType, LEAK_TYPE_LABELS } from "@/lib/types";
import LeakCard from "./LeakCard";

interface LeakTableProps {
  leaks: Leak[];
}

const SEVERITY_FILTERS: { label: string; value: LeakSeverity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function LeakTable({ leaks }: LeakTableProps) {
  const [severityFilter, setSeverityFilter] = useState<
    LeakSeverity | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<LeakType | "all">("all");

  const filteredLeaks = leaks.filter((leak) => {
    if (severityFilter !== "all" && leak.severity !== severityFilter)
      return false;
    if (typeFilter !== "all" && leak.type !== typeFilter) return false;
    return true;
  });

  // Get unique types that exist in leaks
  const existingTypes = Array.from(new Set(leaks.map((l) => l.type)));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white">
          All Leaks ({filteredLeaks.length})
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
          filteredLeaks.map((leak) => (
            <LeakCard key={leak.id} leak={leak} />
          ))
        ) : (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <p className="text-text-muted">
              {leaks.length === 0
                ? "No revenue leaks found! Your billing is clean. 🎉"
                : "No leaks match the current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
