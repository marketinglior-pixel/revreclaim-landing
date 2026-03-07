// ============================================================
// Recovery Agent — Action Executor
// Executes approved recovery actions (dunning emails + platform write actions)
// ============================================================

import { decrypt } from "../encryption";
import { sendDunningEmail } from "../email";
import { executePlatformAction } from "./executors";
import type { ExecutionResult } from "./executors/types";
import type { RecoveryAction, DunningEmailActionData } from "./types";
import type { BillingPlatform } from "../platforms/types";

export type { ExecutionResult };

/**
 * Execute a single approved recovery action.
 *
 * @param action - The action to execute
 * @param actionApiKey - Decrypted write-capable API key (required for platform actions)
 */
export async function executeAction(
  action: RecoveryAction,
  actionApiKey?: string | null
): Promise<ExecutionResult> {
  switch (action.action_type) {
    case "send_dunning_email":
      return executeDunningEmail(action);

    case "retry_payment":
    case "remove_coupon":
    case "cancel_subscription":
      return executePlatformWriteAction(action, actionApiKey);

    default:
      return { success: false, error: `Unknown action type: ${action.action_type}` };
  }
}

/**
 * Execute a platform write action (retry payment, remove coupon, cancel sub).
 * Requires a write-capable API key.
 */
async function executePlatformWriteAction(
  action: RecoveryAction,
  actionApiKey?: string | null
): Promise<ExecutionResult> {
  if (!actionApiKey) {
    return {
      success: false,
      error: "No Action API Key configured. Go to Settings → Action API Key to add a write-capable key.",
    };
  }

  const platform = action.platform as BillingPlatform;
  return executePlatformAction(platform, actionApiKey, action);
}

async function executeDunningEmail(
  action: RecoveryAction
): Promise<ExecutionResult> {
  if (!action.customer_email_encrypted) {
    return { success: false, error: "No customer email available for this action." };
  }

  let customerEmail: string;
  try {
    customerEmail = decrypt(action.customer_email_encrypted);
  } catch {
    return { success: false, error: "Failed to decrypt customer email." };
  }

  if (!customerEmail || !customerEmail.includes("@")) {
    return { success: false, error: "Invalid customer email." };
  }

  const data = action.action_data as DunningEmailActionData;

  try {
    await sendDunningEmail(customerEmail, data.template, {
      amountCents: data.amountCents,
      invoiceNumber: data.invoiceNumber,
      cardLast4: data.cardLast4,
      cardBrand: data.cardBrand,
      expMonth: data.expMonth,
      expYear: data.expYear,
      billingPortalUrl: data.billingPortalUrl,
      platformDashboardUrl: data.platformDashboardUrl,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { success: false, error: message };
  }
}
