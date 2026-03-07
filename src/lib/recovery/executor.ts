// ============================================================
// Recovery Agent — Action Executor
// Executes approved recovery actions (dunning emails, etc.)
// ============================================================

import { decrypt } from "../encryption";
import { sendDunningEmail } from "../email";
import type { RecoveryAction, DunningEmailActionData } from "./types";

export interface ExecutionResult {
  success: boolean;
  error?: string;
}

/**
 * Execute a single approved recovery action.
 */
export async function executeAction(
  action: RecoveryAction
): Promise<ExecutionResult> {
  switch (action.action_type) {
    case "send_dunning_email":
      return executeDunningEmail(action);

    case "retry_payment":
      // Phase 2 — requires write API key
      return {
        success: false,
        error: "Payment retry is not yet available. Coming soon.",
      };

    case "remove_coupon":
      // Phase 2 — requires write API key
      return {
        success: false,
        error: "Coupon removal is not yet available. Coming soon.",
      };

    case "cancel_subscription":
      // Phase 2 — requires write API key
      return {
        success: false,
        error: "Subscription cancellation is not yet available. Coming soon.",
      };

    default:
      return { success: false, error: `Unknown action type: ${action.action_type}` };
  }
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
