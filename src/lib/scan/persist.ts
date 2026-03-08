/**
 * Scan Persistence
 *
 * Saves scan reports to the database, increments scan counts,
 * generates recovery actions, and detects recovery impact.
 */

import { createClient } from "@/lib/supabase/server";
import { canUseRecoveryActions } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { generateRecoveryActions } from "@/lib/recovery/action-generator";
import { detectRecoveries } from "@/lib/recovery/impact-tracker";
import { trackEvent } from "@/lib/analytics";
import { fireAndForget } from "@/lib/fire-and-forget";
import { createLogger } from "@/lib/logger";
import { logAudit } from "@/lib/audit-log";
import type { ScanReport } from "@/lib/types";
import type { BillingPlatform } from "@/lib/platforms/types";

const log = createLogger("SCAN_PERSIST");

interface PersistOptions {
  userId: string;
  report: ScanReport;
  platform: BillingPlatform;
  apiKey: string;
  emailMap: Map<string, string>;
}

/**
 * Save scan report to database, generate recovery actions, and detect impact.
 * All operations are non-critical — errors are logged but don't fail the scan.
 */
export async function persistScanResults({
  userId,
  report,
  platform,
  apiKey,
  emailMap,
}: PersistOptions): Promise<void> {
  try {
    const supabase = await createClient();

    const isTestMode =
      platform === "stripe" ? apiKey.startsWith("rk_test_") : false;

    const { error: dbError } = await supabase.from("reports").insert({
      id: report.id,
      user_id: userId,
      platform,
      summary: JSON.parse(JSON.stringify(report.summary)),
      categories: JSON.parse(JSON.stringify(report.categories)),
      leaks: JSON.parse(JSON.stringify(report.leaks)),
      is_test_mode: isTestMode,
    });

    if (dbError) {
      log.error("Failed to save report to DB:", dbError.message);
      return;
    }

    log.info(`Report ${report.id} saved to DB for user ${userId}`);

    // Audit log
    fireAndForget(
      logAudit({
        userId,
        action: "scan_run",
        resource: "report",
        resourceId: report.id,
        metadata: {
          platform,
          leaksFound: report.summary.leaksFound,
          mrrAtRisk: report.summary.mrrAtRisk,
          healthScore: report.summary.healthScore,
        },
      }),
      "SCAN_AUDIT"
    );

    // Increment scan count and run post-save tasks
    const { data: profile } = await supabase
      .from("profiles")
      .select("scan_count_this_period, plan")
      .eq("id", userId)
      .single();

    if (!profile) return;

    // Increment scan count
    await supabase
      .from("profiles")
      .update({
        scan_count_this_period:
          (profile.scan_count_this_period ?? 0) + 1,
      })
      .eq("id", userId);

    // Generate recovery actions for Pro/Team users
    const userPlan = (profile.plan || "free") as PlanType;
    if (
      canUseRecoveryActions(userPlan).allowed &&
      report.leaks.length > 0
    ) {
      await generateAndInsertActions(
        supabase,
        userId,
        report,
        emailMap,
        platform
      );
    }

    // Detect recovery impact from previously executed actions
    await detectAndTrackImpact(supabase, userId, report);
  } catch (err) {
    log.error("DB save error:", err);
  }
}

/**
 * Generate recovery actions from scan leaks and insert them.
 */
async function generateAndInsertActions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  report: ScanReport,
  emailMap: Map<string, string>,
  platform: BillingPlatform
): Promise<void> {
  try {
    const actions = generateRecoveryActions(report, emailMap, platform);
    if (actions.length === 0) return;

    const rows = actions.map((a) => ({
      user_id: userId,
      report_id: report.id,
      leak_id: a.leak_id,
      action_type: a.action_type as string,
      platform: a.platform,
      customer_email_encrypted: a.customer_email_encrypted,
      customer_id: a.customer_id,
      subscription_id: a.subscription_id,
      action_data: JSON.parse(JSON.stringify(a.action_data)),
      monthly_impact: a.monthly_impact,
    }));

    const { error } = await supabase
      .from("recovery_actions")
      .insert(rows);

    if (error) {
      log.error("Failed to insert recovery actions:", error.message);
    } else {
      log.info(
        `Generated ${actions.length} recovery actions for user ${userId}`
      );
    }
  } catch (err) {
    log.error("Action generation error:", err);
  }
}

/**
 * Cross-reference executed actions with new scan to detect recoveries.
 */
async function detectAndTrackImpact(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  report: ScanReport
): Promise<void> {
  try {
    const { data: executedActions } = await supabase
      .from("recovery_actions")
      .select("id, action_type, customer_id, leak_id, monthly_impact")
      .eq("user_id", userId)
      .eq("status", "executed")
      .neq("report_id", report.id);

    if (!executedActions || executedActions.length === 0) return;

    const impact = detectRecoveries(executedActions, report);
    if (impact.recoveredActions.length > 0) {
      log.info(
        `Recovery impact: $${(impact.totalRecovered / 100).toFixed(0)}/mo recovered from ${impact.recoveredActions.length} actions`
      );
      fireAndForget(
        trackEvent("action_executed", userId, {
          type: "recovery_impact",
          recoveredMonthly: impact.totalRecovered,
          recoveredAnnual: impact.totalRecoveredAnnual,
          recoveredCount: impact.recoveredActions.length,
          stillOpen: impact.stillOpen,
        }),
        "RECOVERY_IMPACT_TRACKING"
      );
    }
  } catch (err) {
    log.error("Impact tracking error:", err);
  }
}
