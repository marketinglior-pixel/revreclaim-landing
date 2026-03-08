"use client";

import { useState, useEffect, useCallback } from "react";
import { ActionCard, type ActionCardData } from "./ActionCard";
import type { ActionStatus, ActionType } from "@/lib/recovery/types";
import { ConfirmActionDialog, DESTRUCTIVE_ACTIONS } from "./ConfirmActionDialog";

interface ActionQueueProps {
  plan: "free" | "pro" | "team";
}

type FilterStatus = "all" | ActionStatus;
type FilterType = "all" | ActionType;

export function ActionQueue({ plan }: ActionQueueProps) {
  const [actions, setActions] = useState<ActionCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [, setExecutedCount] = useState(0);
  const [remaining, setRemaining] = useState<number | undefined>(undefined);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("pending");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  // Selection for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Executing state
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkExecuting, setBulkExecuting] = useState(false);
  const [bulkExecuteProgress, setBulkExecuteProgress] = useState({ done: 0, total: 0, failed: 0 });

  // Confirmation dialog for destructive actions
  const [confirmAction, setConfirmAction] = useState<ActionCardData | null>(null);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/actions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch actions");
        return;
      }

      setActions(data.actions || []);
      setCanApprove(data.canApprove);
      setExecutedCount(data.executedCount ?? 0);
      setRemaining(data.remaining);
    } catch {
      setError("Failed to load actions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Clear selection when filter changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter, typeFilter]);

  // Filtered actions
  const filteredActions =
    typeFilter === "all"
      ? actions
      : actions.filter((a) => a.action_type === typeFilter);

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all visible pending
  const selectAll = () => {
    const pending = filteredActions
      .filter((a) => a.status === "pending")
      .map((a) => a.id);
    setSelectedIds(new Set(pending));
  };

  const deselectAll = () => setSelectedIds(new Set());

  // Approve/dismiss handlers
  async function handleBulkAction(decision: "approve" | "dismiss") {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);

    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionIds: Array.from(selectedIds),
          decision,
        }),
      });

      if (res.ok) {
        setSelectedIds(new Set());
        await fetchActions();
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${decision} actions`);
      }
    } catch {
      setError(`Failed to ${decision} actions`);
    } finally {
      setBulkProcessing(false);
    }
  }

  async function handleSingleApprove(id: string) {
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionIds: [id], decision: "approve" }),
      });
      if (res.ok) await fetchActions();
    } catch {
      setError("Failed to approve action");
    }
  }

  async function handleSingleDismiss(id: string) {
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionIds: [id], decision: "dismiss" }),
      });
      if (res.ok) await fetchActions();
    } catch {
      setError("Failed to dismiss action");
    }
  }

  async function handleRetry(id: string) {
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionIds: [id], decision: "retry" }),
      });
      if (res.ok) await fetchActions();
      else {
        const data = await res.json();
        setError(data.error || "Failed to retry action");
      }
    } catch {
      setError("Failed to retry action");
    }
  }

  async function handleExecute(id: string) {
    const action = actions.find((a) => a.id === id);
    if (!action) return;

    // Gate destructive actions through a confirmation dialog
    if (DESTRUCTIVE_ACTIONS.has(action.action_type)) {
      setConfirmAction(action);
      return;
    }

    await executeActionDirectly(id);
  }

  async function executeActionDirectly(id: string) {
    setExecutingId(id);
    try {
      const res = await fetch("/api/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: id }),
      });

      if (res.ok) {
        await fetchActions();
      } else {
        const data = await res.json();
        setError(data.error || "Execution failed");
      }
    } catch {
      setError("Failed to execute action");
    } finally {
      setExecutingId(null);
      setConfirmAction(null);
    }
  }

  async function handleBulkExecute() {
    const approvedActions = filteredActions.filter((a) => a.status === "approved");
    if (approvedActions.length === 0) return;

    setBulkExecuting(true);
    setBulkExecuteProgress({ done: 0, total: approvedActions.length, failed: 0 });

    let failCount = 0;
    for (let i = 0; i < approvedActions.length; i++) {
      const action = approvedActions[i];
      setExecutingId(action.id);

      try {
        const res = await fetch("/api/actions/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionId: action.id }),
        });

        if (!res.ok) failCount++;
      } catch {
        failCount++;
      }

      setBulkExecuteProgress({ done: i + 1, total: approvedActions.length, failed: failCount });
    }

    setExecutingId(null);
    setBulkExecuting(false);

    if (failCount > 0) {
      setError(`${failCount} of ${approvedActions.length} actions failed. Check the Failed tab for details.`);
    }

    await fetchActions();
  }

  // Status filter tabs
  const statusTabs: { value: FilterStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "executed", label: "Executed" },
    { value: "failed", label: "Failed" },
    { value: "dismissed", label: "Dismissed" },
    { value: "all", label: "All" },
  ];

  const typeOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "send_dunning_email", label: "Payment Reminders" },
    { value: "retry_payment", label: "Retry Payment" },
    { value: "remove_coupon", label: "Remove Coupon" },
    { value: "cancel_subscription", label: "Cancel Sub" },
  ];

  const pendingCount = filteredActions.filter(
    (a) => a.status === "pending"
  ).length;
  const approvedCount = filteredActions.filter(
    (a) => a.status === "approved"
  ).length;

  const isFreeUser = plan === "free";
  const freeActionUsed = isFreeUser && remaining === 0;
  const freeActionAvailable = isFreeUser && remaining !== undefined && remaining > 0;

  return (
    <div className="rounded-2xl border border-border bg-surface">
      {/* Free user banner */}
      {freeActionAvailable && (
        <div className="border-b border-brand/20 bg-brand/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎁</span>
            <p className="text-sm text-brand font-medium">
              You have {remaining} free recovery action{remaining !== 1 ? "s" : ""}. Use it on your most impactful leak.
            </p>
          </div>
        </div>
      )}
      {freeActionUsed && (
        <div className="border-b border-brand/20 bg-brand/5 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-brand font-medium">
                Free action used! Upgrade to Pro for unlimited recovery actions.
              </p>
            </div>
            <a
              href="/pricing"
              className="flex-shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-black hover:bg-brand-dark transition"
            >
              Upgrade →
            </a>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-b border-border p-4 space-y-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === tab.value
                  ? "bg-brand/15 text-brand border border-brand/30"
                  : "bg-surface-lighter text-text-muted hover:text-white border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type filter + bulk actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterType)}
            className="rounded-lg border border-border bg-surface-dim px-3 py-1.5 text-xs text-text-secondary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Bulk controls (only for pending tab with selectable items) */}
          {statusFilter === "pending" && canApprove && pendingCount > 0 && (
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 ? (
                <>
                  <span className="text-xs text-text-muted">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction("approve")}
                    disabled={bulkProcessing}
                    className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-black hover:bg-brand-dark transition disabled:opacity-50"
                  >
                    {bulkProcessing ? "Processing…" : "Approve Selected"}
                  </button>
                  <button
                    onClick={() => handleBulkAction("dismiss")}
                    disabled={bulkProcessing}
                    className="rounded-lg bg-surface-lighter px-3 py-1.5 text-xs font-medium text-text-muted hover:text-white transition disabled:opacity-50"
                  >
                    Dismiss Selected
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-text-dim hover:text-text-muted transition"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <button
                  onClick={selectAll}
                  className="text-xs text-text-muted hover:text-brand transition"
                >
                  Select all ({pendingCount})
                </button>
              )}
            </div>
          )}

          {/* Execute All Approved (only for approved tab) */}
          {statusFilter === "approved" && approvedCount > 0 && !bulkExecuting && (
            <button
              onClick={handleBulkExecute}
              disabled={freeActionUsed}
              className="rounded-lg bg-brand px-4 py-1.5 text-xs font-bold text-black hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Execute All ({approvedCount})
            </button>
          )}
        </div>

        {/* Bulk execution progress bar */}
        {bulkExecuting && (
          <div className="rounded-lg bg-surface-dim border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                <span className="text-xs font-medium text-white">
                  Executing {bulkExecuteProgress.done}/{bulkExecuteProgress.total}…
                </span>
              </div>
              {bulkExecuteProgress.failed > 0 && (
                <span className="text-xs text-danger">
                  {bulkExecuteProgress.failed} failed
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-surface-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${bulkExecuteProgress.total > 0 ? (bulkExecuteProgress.done / bulkExecuteProgress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-danger/60 hover:text-danger transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-muted">
                Loading actions…
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredActions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-full bg-surface-lighter p-4">
              <svg
                className="h-8 w-8 text-text-dim"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              No {statusFilter !== "all" ? statusFilter : ""} actions
            </h3>
            <p className="text-xs text-text-muted max-w-xs">
              {statusFilter === "pending"
                ? "Run a scan to generate recovery actions. Actions will appear here for your review."
                : "No actions match the current filters."}
            </p>
          </div>
        )}

        {/* Action list */}
        {!loading && filteredActions.length > 0 && (
          <div className="space-y-2">
            {filteredActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                selected={selectedIds.has(action.id)}
                onToggleSelect={toggleSelect}
                onApprove={handleSingleApprove}
                onDismiss={handleSingleDismiss}
                onExecute={handleExecute}
                onRetry={handleRetry}
                canApprove={canApprove}
                executing={executingId === action.id}
                remaining={remaining}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation dialog for destructive actions */}
      <ConfirmActionDialog
        action={confirmAction}
        onConfirm={() => {
          if (confirmAction) executeActionDirectly(confirmAction.id);
        }}
        onCancel={() => setConfirmAction(null)}
        executing={executingId === confirmAction?.id}
      />
    </div>
  );
}
