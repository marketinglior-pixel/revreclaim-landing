// ============================================================
// Recovery Agent — Action Generator
// Converts scan report leaks into actionable recovery items
// ============================================================

import { encrypt } from "../encryption";
import type { Leak, ScanReport } from "../types";
import type { BillingPlatform, NormalizedBillingData } from "../platforms/types";
import {
  LEAK_TO_ACTIONS,
  type ActionType,
  type DunningEmailActionData,
  type RemoveCouponActionData,
  type DunningTemplate,
} from "./types";

export interface GeneratedAction {
  leak_id: string;
  action_type: ActionType;
  platform: string;
  customer_email_encrypted: string | null;
  customer_id: string;
  subscription_id: string | null;
  action_data: Record<string, unknown>;
  monthly_impact: number;
}

/**
 * Generate recovery actions from a completed scan report.
 *
 * @param report - The scan report with detected leaks
 * @param emailMap - Map of customerId → real (unmasked) email from scan data
 * @param platform - The billing platform that was scanned
 * @returns Array of actions ready for DB insertion
 */
export function generateRecoveryActions(
  report: ScanReport,
  emailMap: Map<string, string>,
  platform: BillingPlatform
): GeneratedAction[] {
  const actions: GeneratedAction[] = [];

  for (const leak of report.leaks) {
    const actionDefs = LEAK_TO_ACTIONS[leak.type];
    if (!actionDefs || actionDefs.length === 0) continue;

    const realEmail = emailMap.get(leak.customerId) || null;
    const encryptedEmail = realEmail ? encrypt(realEmail) : null;

    for (const def of actionDefs) {
      // For dunning emails, skip if we don't have an email
      if (def.actionType === "send_dunning_email" && !encryptedEmail) continue;

      const actionData = buildActionData(leak, def.actionType, def.dunningTemplate, platform);

      actions.push({
        leak_id: leak.id,
        action_type: def.actionType,
        platform,
        customer_email_encrypted: encryptedEmail,
        customer_id: leak.customerId,
        subscription_id: leak.subscriptionId || null,
        action_data: actionData as unknown as Record<string, unknown>,
        monthly_impact: leak.monthlyImpact,
      });
    }
  }

  return actions;
}

/**
 * Build email map from normalized billing data.
 * Collects customerId → email pairs from subscriptions and invoices.
 */
export function buildEmailMap(data: NormalizedBillingData): Map<string, string> {
  const map = new Map<string, string>();

  for (const sub of data.subscriptions) {
    if (sub.customerEmail) {
      map.set(sub.customerId, sub.customerEmail);
    }
  }

  for (const inv of data.invoices) {
    if (inv.customerEmail && !map.has(inv.customerId)) {
      map.set(inv.customerId, inv.customerEmail);
    }
  }

  return map;
}

// --- Helpers ---

function buildActionData(
  leak: Leak,
  actionType: ActionType,
  dunningTemplate?: DunningTemplate,
  platform?: BillingPlatform
): DunningEmailActionData | RemoveCouponActionData {
  const meta = leak.metadata || {};

  if (actionType === "send_dunning_email" && dunningTemplate) {
    const data: DunningEmailActionData = {
      template: dunningTemplate,
      amountCents: leak.monthlyImpact,
      platformDashboardUrl: leak.platformUrl || undefined,
    };

    if (dunningTemplate === "failed_payment") {
      data.invoiceId = meta.invoiceId as string | undefined;
      data.invoiceNumber = meta.invoiceNumber as string | undefined;
    }

    if (dunningTemplate === "expiring_card") {
      data.cardLast4 = meta.cardLast4 as string | undefined;
      data.cardBrand = meta.cardBrand as string | undefined;
      data.expMonth = meta.expMonth as number | undefined;
      data.expYear = meta.expYear as number | undefined;
    }

    // Build billing portal URL based on platform
    if (platform) {
      data.billingPortalUrl = getBillingPortalUrl(platform, leak.customerId);
    }

    return data;
  }

  if (actionType === "remove_coupon") {
    return {
      couponId: (meta.couponId as string) || "",
      couponName: (meta.couponName as string) || undefined,
      subscriptionId: leak.subscriptionId || "",
    };
  }

  // Fallback
  return {
    template: "payment_update" as DunningTemplate,
    amountCents: leak.monthlyImpact,
    platformDashboardUrl: leak.platformUrl || undefined,
  };
}

function getBillingPortalUrl(
  platform: BillingPlatform,
  customerId: string
): string {
  switch (platform) {
    case "stripe":
      return `https://dashboard.stripe.com/customers/${customerId}`;
    case "polar":
      return `https://polar.sh/dashboard/customers/${customerId}`;
    case "paddle":
      return `https://vendors.paddle.com/customers/${customerId}`;
    default:
      return "";
  }
}
