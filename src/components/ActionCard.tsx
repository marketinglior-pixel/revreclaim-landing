"use client";

import { useState } from "react";
import { ACTION_TYPE_LABELS, ACTION_TYPE_DESCRIPTIONS } from "@/lib/recovery/types";
import type { ActionType, ActionStatus } from "@/lib/recovery/types";

export interface ActionCardData {
  id: string;
  action_type: ActionType;
  status: ActionStatus;
  platform: string;
  customer_id: string;
  subscription_id: string | null;
  monthly_impact: number;
  error_message: string | null;
  created_at: string;
  executed_at: string | null;
  action_data: Record<string, unknown>;
}

interface ActionCardProps {
  action: ActionCardData;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
  onExecute: (id: string) => void;
  onRetry: (id: string) => void;
  canApprove: boolean;
  executing: boolean;
  remaining?: number;
  privacyMode?: boolean;
  missingWriteKey?: boolean;
}

const STATUS_BADGE: Record<
  ActionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning border-warning/25",
  },
  approved: {
    label: "Approved",
    className: "bg-info/15 text-info border-info/25",
  },
  executed: {
    label: "Executed",
    className: "bg-brand/15 text-brand border-brand/25",
  },
  failed: {
    label: "Failed",
    className: "bg-danger/15 text-danger border-danger/25",
  },
  dismissed: {
    label: "Dismissed",
    className: "bg-text-muted/15 text-text-muted border-text-muted/25",
  },
};

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  send_dunning_email: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  retry_payment: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </svg>
  ),
  remove_coupon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  cancel_subscription: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
};

function maskCustomerId(id: string): string {
  if (id.length <= 8) return id;
  return id.slice(0, 4) + "•••" + id.slice(-4);
}

/** Extract human-readable preview details from action_data */
function getPreviewDetails(action: ActionCardData, privacyMode?: boolean): { label: string; value: string }[] {
  const details: { label: string; value: string }[] = [];
  const data = action.action_data;

  switch (action.action_type) {
    case "send_dunning_email": {
      const templateNames: Record<string, string> = {
        failed_payment: "Failed Payment Reminder",
        expiring_card: "Expiring Card Warning",
        payment_update: "Payment Method Update Request",
      };
      if (data.template) details.push({ label: "Email Template", value: templateNames[data.template as string] || String(data.template) });
      if (data.customerName && !privacyMode) details.push({ label: "Customer Name", value: String(data.customerName) });
      if (data.amountCents) details.push({ label: "Amount Due", value: `$${(Number(data.amountCents) / 100).toFixed(2)}` });
      if (data.invoiceId) details.push({ label: "Invoice", value: maskCustomerId(String(data.invoiceId)) });
      if (data.cardLast4) details.push({ label: "Card", value: `${data.cardBrand || "Card"} ••••${data.cardLast4}` });
      if (data.expMonth && data.expYear) details.push({ label: "Card Expires", value: `${data.expMonth}/${data.expYear}` });
      break;
    }
    case "retry_payment": {
      if (data.invoiceId) details.push({ label: "Invoice", value: maskCustomerId(String(data.invoiceId)) });
      if (data.amountCents) details.push({ label: "Amount", value: `$${(Number(data.amountCents) / 100).toFixed(2)}` });
      break;
    }
    case "remove_coupon": {
      if (data.couponName) details.push({ label: "Coupon", value: String(data.couponName) });
      else if (data.couponId) details.push({ label: "Coupon ID", value: maskCustomerId(String(data.couponId)) });
      if (data.subscriptionId) details.push({ label: "Subscription", value: maskCustomerId(String(data.subscriptionId)) });
      break;
    }
    case "cancel_subscription": {
      if (data.subscriptionId) details.push({ label: "Subscription", value: maskCustomerId(String(data.subscriptionId)) });
      if (data.reason) details.push({ label: "Reason", value: String(data.reason) });
      break;
    }
  }

  return details;
}

export function ActionCard({
  action,
  selected,
  onToggleSelect,
  onApprove,
  onDismiss,
  onExecute,
  onRetry,
  canApprove,
  executing,
  privacyMode,
  missingWriteKey,
}: ActionCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState(0);
  const badge = STATUS_BADGE[action.status];
  const label = ACTION_TYPE_LABELS[action.action_type] || action.action_type;
  const description =
    ACTION_TYPE_DESCRIPTIONS[action.action_type] || "";
  const icon = ACTION_ICONS[action.action_type];
  const impact = action.monthly_impact / 100;
  const createdDate = new Date(action.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const previewDetails = getPreviewDetails(action, privacyMode);

  return (
    <div
      className={`group rounded-xl border transition-all ${
        selected
          ? "border-brand/40 bg-brand/5"
          : "border-border bg-surface hover:bg-surface-light/50"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox for pending actions */}
        {action.status === "pending" && canApprove && (
          <label className="mt-0.5 flex-shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(action.id)}
              className="h-4 w-4 rounded border-border bg-surface-dim text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer"
            />
          </label>
        )}

        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5 text-text-muted group-hover:text-text-secondary transition">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-white">{label}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>

          <p className="text-xs text-text-muted mb-2 line-clamp-1">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-text-dim">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              {privacyMode ? `Customer #${action.id.slice(0, 4)}` : maskCustomerId(action.customer_id)}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              {action.platform}
            </span>
            <span>{createdDate}</span>
          </div>

          {/* Error message for failed actions */}
          {action.status === "failed" && action.error_message && (
            <div className="mt-2 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2 text-xs text-danger">
              {action.error_message}
            </div>
          )}

          {/* Preview toggle */}
          {previewDetails.length > 0 && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="mt-2 flex items-center gap-1 text-[11px] text-text-dim hover:text-text-muted transition"
            >
              <svg className={`h-3 w-3 transition-transform ${showPreview ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {showPreview ? "Hide details" : "Preview details"}
            </button>
          )}

          {/* Expandable preview */}
          {showPreview && previewDetails.length > 0 && (
            <div className="mt-2 rounded-lg bg-surface-dim border border-border px-3 py-2.5 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-text-dim font-medium mb-1.5">What this action will do</p>
              {previewDetails.map((detail) => (
                <div key={detail.label} className="flex justify-between text-xs">
                  <span className="text-text-muted">{detail.label}</span>
                  <span className="text-white font-mono text-[11px]">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side: impact + actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <span className="text-sm font-bold text-brand">
              ${impact.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-muted">/mo</span>
          </div>

          {/* Action buttons */}
          {action.status === "pending" && canApprove && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onApprove(action.id)}
                className="rounded-lg bg-brand/10 px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 transition"
              >
                Approve
              </button>
              <button
                onClick={() => onDismiss(action.id)}
                className="rounded-lg bg-surface-lighter px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-white hover:bg-surface-lighter/80 transition"
              >
                Dismiss
              </button>
            </div>
          )}

          {action.status === "approved" && canApprove && (
            missingWriteKey ? (
              <a
                href="/dashboard/settings#action-api-key"
                className="rounded-lg bg-warning/10 border border-warning/25 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/20 transition flex items-center gap-1.5"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                Add API Key
              </a>
            ) : (
              <button
                onClick={() => {
                  setCelebrationAmount(impact);
                  onExecute(action.id);
                  // Show celebration after a short delay (assume success)
                  setTimeout(() => setShowCelebration(true), 1500);
                  setTimeout(() => setShowCelebration(false), 5000);
                }}
                disabled={executing}
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-black hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {executing ? (
                  <>
                    <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Running…
                  </>
                ) : (
                  "Execute"
                )}
              </button>
            )
          )}

          {action.status === "failed" && canApprove && (
            <button
              onClick={() => onRetry(action.id)}
              className="rounded-lg bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/20 transition flex items-center gap-1.5"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Retry
            </button>
          )}

          {/* Upgrade gate for free users who exhausted their free action */}
          {action.status === "pending" && !canApprove && (
            <a
              href="/pricing"
              className="rounded-lg bg-brand/10 px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 transition"
            >
              Free action used. Upgrade →
            </a>
          )}
        </div>
      </div>

      {/* Recovery Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-brand/95 backdrop-blur-sm animate-fade-in-up">
          <div className="text-center px-6">
            <div className="flex items-center justify-center mb-2">
              <svg className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-extrabold text-black">
              ${celebrationAmount.toLocaleString()}/mo Recovered!
            </p>
            <p className="text-xs text-black/70 mt-1">
              That&apos;s ${(celebrationAmount * 12).toLocaleString()}/year back in your account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
