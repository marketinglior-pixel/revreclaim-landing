// ============================================================
// Recovery Agent — Types
// ============================================================

import type { BillingPlatform } from "../platforms/types";
import type { LeakType } from "../types";

/** Actions the recovery agent can perform */
export type ActionType =
  | "send_dunning_email"
  | "retry_payment"
  | "remove_coupon"
  | "cancel_subscription";

/** Status lifecycle: pending → approved → executed/failed  OR  pending → dismissed */
export type ActionStatus =
  | "pending"
  | "approved"
  | "executed"
  | "failed"
  | "dismissed";

/** Dunning email sub-types */
export type DunningTemplate =
  | "failed_payment"
  | "expiring_card"
  | "payment_update";

/** Data stored in action_data JSONB column, varies by action type */
export interface DunningEmailActionData {
  template: DunningTemplate;
  customerName?: string;
  amountCents?: number;
  invoiceId?: string;
  invoiceNumber?: string;
  cardLast4?: string;
  cardBrand?: string;
  expMonth?: number;
  expYear?: number;
  billingPortalUrl?: string;
  platformDashboardUrl?: string;
}

export interface RetryPaymentActionData {
  invoiceId: string;
  amountCents: number;
}

export interface RemoveCouponActionData {
  couponId: string;
  couponName?: string;
  subscriptionId: string;
}

export interface CancelSubscriptionActionData {
  subscriptionId: string;
  reason: string;
}

export type ActionData =
  | DunningEmailActionData
  | RetryPaymentActionData
  | RemoveCouponActionData
  | CancelSubscriptionActionData;

/** A recovery action as stored in the database */
export interface RecoveryAction {
  id: string;
  user_id: string;
  report_id: string;
  leak_id: string;
  action_type: ActionType;
  status: ActionStatus;
  platform: BillingPlatform;
  customer_email_encrypted: string | null;
  customer_id: string;
  subscription_id: string | null;
  action_data: ActionData;
  monthly_impact: number; // cents
  error_message: string | null;
  created_at: string;
  approved_at: string | null;
  executed_at: string | null;
}

/** Metadata for UI display — maps action types to labels/icons */
export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  send_dunning_email: "Send Payment Reminder",
  retry_payment: "Retry Payment",
  remove_coupon: "Remove Expired Coupon",
  cancel_subscription: "Cancel Stuck Subscription",
};

export const ACTION_TYPE_DESCRIPTIONS: Record<ActionType, string> = {
  send_dunning_email:
    "Send an email to the customer asking them to update their payment method.",
  retry_payment:
    "Retry the failed payment through the billing platform.",
  remove_coupon:
    "Remove the expired coupon from the subscription so the customer pays full price.",
  cancel_subscription:
    "Cancel the stuck subscription that's stuck in a broken state.",
};

/** Which leak types can generate which action types */
export const LEAK_TO_ACTIONS: Partial<
  Record<LeakType, { actionType: ActionType; dunningTemplate?: DunningTemplate }[]>
> = {
  failed_payment: [
    { actionType: "send_dunning_email", dunningTemplate: "failed_payment" },
  ],
  stuck_subscription: [
    { actionType: "send_dunning_email", dunningTemplate: "payment_update" },
  ],
  expiring_card: [
    { actionType: "send_dunning_email", dunningTemplate: "expiring_card" },
  ],
  missing_payment_method: [
    { actionType: "send_dunning_email", dunningTemplate: "payment_update" },
  ],
  expired_coupon: [
    { actionType: "remove_coupon" },
  ],
  never_expiring_discount: [
    { actionType: "remove_coupon" },
  ],
  // legacy_pricing → manual review only (requires manual price migration)
  // unbilled_overage → manual review only (requires pricing/quantity adjustment)
  // trial_expired → manual review: convert to paid or cancel
  trial_expired: [
    { actionType: "cancel_subscription" },
  ],
  // duplicate_subscription → cancel the duplicate
  duplicate_subscription: [
    { actionType: "cancel_subscription" },
  ],
};
