"use client";

import type { ActionCardData } from "./ActionCard";
import type { ActionType } from "@/lib/recovery/types";
import { ACTION_TYPE_LABELS } from "@/lib/recovery/types";

// Actions that permanently modify customer state and need an extra confirmation
export const DESTRUCTIVE_ACTIONS: Set<ActionType> = new Set([
  "cancel_subscription",
  "remove_coupon",
]);

const DESTRUCTIVE_WARNINGS: Partial<Record<ActionType, string>> = {
  cancel_subscription:
    "This will permanently cancel the customer's subscription. They will lose access at the end of their current billing period. This action cannot be undone.",
  remove_coupon:
    "This will remove the discount from the subscription. The customer will be charged full price starting with their next billing cycle.",
};

/** Extract action-specific preview details for the confirmation dialog */
function getConfirmDetails(action: ActionCardData): { label: string; value: string }[] {
  const details: { label: string; value: string }[] = [];
  const data = action.action_data;

  if (action.action_type === "remove_coupon") {
    if (data.couponName) details.push({ label: "Coupon", value: String(data.couponName) });
    else if (data.couponId) details.push({ label: "Coupon ID", value: String(data.couponId) });
  }

  if (action.action_type === "cancel_subscription") {
    if (data.reason) details.push({ label: "Reason", value: String(data.reason) });
  }

  return details;
}

interface ConfirmActionDialogProps {
  action: ActionCardData | null;
  onConfirm: () => void;
  onCancel: () => void;
  executing: boolean;
}

export function ConfirmActionDialog({
  action,
  onConfirm,
  onCancel,
  executing,
}: ConfirmActionDialogProps) {
  if (!action) return null;

  const label = ACTION_TYPE_LABELS[action.action_type];
  const warning =
    DESTRUCTIVE_WARNINGS[action.action_type] ||
    "This action may affect the customer's billing. Please confirm.";
  const impactDisplay =
    action.monthly_impact > 0
      ? `$${(action.monthly_impact / 100).toFixed(0)}/mo`
      : null;
  const confirmDetails = getConfirmDetails(action);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!executing ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-danger"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Confirm: {label}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                This is a destructive action
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              {warning}
            </p>
          </div>

          {/* Action details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Customer</span>
              <span className="text-white font-mono">
                {action.customer_id.slice(0, 8)}…
                {action.customer_id.slice(-4)}
              </span>
            </div>
            {action.subscription_id && (
              <div className="flex justify-between">
                <span className="text-text-muted">Subscription</span>
                <span className="text-white font-mono">
                  {action.subscription_id.slice(0, 8)}…
                  {action.subscription_id.slice(-4)}
                </span>
              </div>
            )}
            {impactDisplay && (
              <div className="flex justify-between">
                <span className="text-text-muted">Monthly Impact</span>
                <span className="text-brand font-semibold">
                  {impactDisplay}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Platform</span>
              <span className="text-white capitalize">{action.platform}</span>
            </div>
            {confirmDetails.map((detail) => (
              <div key={detail.label} className="flex justify-between">
                <span className="text-text-muted">{detail.label}</span>
                <span className="text-white">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 bg-surface-dim border-t border-border">
          <button
            onClick={onCancel}
            disabled={executing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-lighter hover:bg-surface-light border border-border rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={executing}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-danger hover:bg-danger/90 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {executing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Executing…
              </>
            ) : (
              "Confirm & Execute"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
