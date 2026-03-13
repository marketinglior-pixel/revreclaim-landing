/**
 * Recovery Impact Tracker
 *
 * After a new scan completes, cross-references previously executed actions
 * to detect which leaks were successfully recovered.
 *
 * A leak is considered "recovered" when:
 * 1. An action was executed for a specific customer + leak type
 * 2. The same customer + leak type no longer appears in the new scan
 *
 * This approach works without schema changes — recovery data is stored
 * in the existing action_data JSONB and tracked via in-memory comparison.
 */

import { createLogger } from "@/lib/logger";
import type { ScanReport, Leak } from "@/lib/types";
import type { RecoveryAction } from "./types";

const log = createLogger("IMPACT_TRACKER");

export interface RecoveryResult {
  actionId: string;
  actionType: string;
  customerId: string;
  leakType: string;
  monthlyImpact: number; // cents
  recoveredAt: string; // ISO timestamp
}

export interface ImpactSummary {
  totalRecovered: number; // cents (monthly)
  totalRecoveredAnnual: number; // cents (annual)
  recoveredActions: RecoveryResult[];
  stillOpen: number; // executed actions where the leak persists
}

/**
 * Build a set of "leak keys" from a scan report for fast lookup.
 * Key format: `{customerId}::{leakType}`
 */
function buildLeakKeySet(leaks: Leak[]): Set<string> {
  const keys = new Set<string>();
  for (const leak of leaks) {
    if (leak.customerId) {
      keys.add(`${leak.customerId}::${leak.type}`);
    }
  }
  return keys;
}

/**
 * Compare executed recovery actions against a new scan to detect recoveries.
 *
 * @param executedActions - Actions that were previously executed (status = "executed")
 * @param newReport - The latest scan report
 * @returns Impact summary with recovered and still-open counts
 */
export function detectRecoveries(
  executedActions: {
    id: string;
    action_type: string;
    customer_id: string;
    leak_id: string;
    monthly_impact: number;
  }[],
  newReport: ScanReport
): ImpactSummary {
  const currentLeakKeys = buildLeakKeySet(newReport.leaks);
  const recoveredActions: RecoveryResult[] = [];
  let stillOpen = 0;

  for (const action of executedActions) {
    // Determine the leak type from the action's leak_id by matching against
    // the action_type → leak_type mapping
    const leakType = actionTypeToLeakType(action.action_type);
    if (!leakType) {
      continue;
    }

    const key = `${action.customer_id}::${leakType}`;

    if (!currentLeakKeys.has(key)) {
      // The leak is no longer present — recovery successful!
      recoveredActions.push({
        actionId: action.id,
        actionType: action.action_type,
        customerId: action.customer_id,
        leakType,
        monthlyImpact: action.monthly_impact,
        recoveredAt: new Date().toISOString(),
      });
    } else {
      stillOpen++;
    }
  }

  const totalRecovered = recoveredActions.reduce(
    (sum, r) => sum + r.monthlyImpact,
    0
  );

  log.info(
    `Impact analysis: ${recoveredActions.length} recovered ($${(totalRecovered / 100).toFixed(0)}/mo), ${stillOpen} still open`
  );

  return {
    totalRecovered,
    totalRecoveredAnnual: totalRecovered * 12,
    recoveredActions,
    stillOpen,
  };
}

/**
 * Map action types back to the leak types they address.
 * An action can address multiple leak types; we return the primary one.
 */
function actionTypeToLeakType(
  actionType: string
): string | null {
  // Reverse map from LEAK_TO_ACTIONS
  const mapping: Record<string, string[]> = {
    send_dunning_email: [
      "failed_payment",
      "stuck_subscription",
      "expiring_card",
      "missing_payment_method",
    ],
    retry_payment: ["failed_payment"],
    remove_coupon: ["expired_coupon", "never_expiring_discount"],
    cancel_subscription: ["stuck_subscription"],
  };

  const types = mapping[actionType];
  return types ? types[0] : null;
}

/**
 * For a given action, try to find the matching leak type by looking up the
 * actual leak in the report's leaks array.
 */
export function findLeakTypeForAction(
  action: Pick<RecoveryAction, "leak_id">,
  reportLeaks: Leak[]
): string | null {
  const leak = reportLeaks.find((l) => l.id === action.leak_id);
  return leak?.type || null;
}
