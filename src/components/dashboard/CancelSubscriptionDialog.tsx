"use client";

import { useState } from "react";

interface CancelSubscriptionDialogProps {
  plan: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const FEATURES_LOST: Record<string, string[]> = {
  pro: [
    "Unlimited billing scans",
    "Automated weekly/daily scans",
    "Unlimited recovery actions",
    "Email scan alerts",
  ],
  team: [
    "Everything in Pro",
    "Team member access (up to 10)",
    "Shared reports & actions",
  ],
};

export function CancelSubscriptionDialog({
  plan,
  onCancel,
  onConfirm,
  loading,
}: CancelSubscriptionDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const features = FEATURES_LOST[plan] || FEATURES_LOST.pro;
  const canConfirm = confirmText.toLowerCase() === "cancel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cancel your {plan.charAt(0).toUpperCase() + plan.slice(1)} plan?
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Your billing leaks won&apos;t fix themselves
              </p>
            </div>
          </div>

          {/* What you'll lose */}
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-danger uppercase tracking-wider mb-2">
              You&apos;ll lose access to:
            </p>
            <ul className="space-y-1.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-danger/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Downgrade note */}
          <div className="bg-surface-dim border border-border rounded-lg p-3 mb-4">
            <p className="text-xs text-text-muted">
              Your account will be downgraded to the <span className="text-white font-semibold">Free</span> plan at the end of your current billing period. You&apos;ll keep access until then.
            </p>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-xs text-text-muted mb-1.5">
              Type <span className="text-white font-mono font-semibold">cancel</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="cancel"
              className="w-full px-3 py-2.5 bg-surface-dim border border-border rounded-lg text-white placeholder-text-dim focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger transition text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 bg-surface-dim border-t border-border">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-brand hover:bg-brand-dark rounded-lg transition disabled:opacity-50"
          >
            Keep My Plan
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !canConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Subscription"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
