import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectRecoveries } from "@/lib/recovery/impact-tracker";
import type { ScanReport } from "@/lib/types";
import { createLogger } from "@/lib/logger";

const log = createLogger("RECOVERY_STATS");

/**
 * GET /api/recovery-stats — Recovery analytics for the current user.
 *
 * Queries executed actions, cross-references with latest scan,
 * and returns recovery impact summary + ROI.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's plan for ROI calculation
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = (profile?.plan as string) || "free";

    // Fetch all executed actions for this user
    const { data: executedActions, error: actionsError } = await supabase
      .from("recovery_actions")
      .select("id, action_type, customer_id, leak_id, monthly_impact, executed_at")
      .eq("user_id", user.id)
      .eq("status", "executed");

    if (actionsError) {
      log.error("Failed to fetch executed actions:", actionsError.message);
      return NextResponse.json(
        { error: "Failed to fetch recovery data" },
        { status: 500 }
      );
    }

    if (!executedActions || executedActions.length === 0) {
      return NextResponse.json({
        totalRecoveredMonthly: 0,
        totalRecoveredAnnual: 0,
        recoveryRate: 0,
        totalExecuted: 0,
        totalRecovered: 0,
        totalStillOpen: 0,
        recoveredActions: [],
        roi: 0,
        recentActions: [],
      });
    }

    // Fetch the latest scan report for comparison
    const { data: latestReportRow } = await supabase
      .from("reports")
      .select("id, summary, categories, leaks, platform, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!latestReportRow) {
      // No scan report — just return raw executed action totals
      const totalMonthly = executedActions.reduce(
        (sum, a) => sum + (a.monthly_impact || 0),
        0
      );
      return NextResponse.json({
        totalRecoveredMonthly: totalMonthly,
        totalRecoveredAnnual: totalMonthly * 12,
        recoveryRate: 0,
        totalExecuted: executedActions.length,
        totalRecovered: 0,
        totalStillOpen: executedActions.length,
        recoveredActions: [],
        roi: 0,
        recentActions: executedActions.slice(0, 5).map((a) => ({
          id: a.id,
          actionType: a.action_type,
          customerId: a.customer_id,
          monthlyImpact: a.monthly_impact,
          executedAt: a.executed_at,
        })),
      });
    }

    // Build a ScanReport object for detectRecoveries
    const latestReport: ScanReport = {
      id: latestReportRow.id as string,
      platform: (latestReportRow.platform as string) || "stripe",
      scannedAt: latestReportRow.created_at as string,
      summary: latestReportRow.summary as unknown as ScanReport["summary"],
      categories:
        latestReportRow.categories as unknown as ScanReport["categories"],
      leaks: latestReportRow.leaks as unknown as ScanReport["leaks"],
    };

    // Run impact detection
    const impact = detectRecoveries(
      executedActions.map((a) => ({
        id: a.id,
        action_type: a.action_type,
        customer_id: a.customer_id,
        leak_id: a.leak_id,
        monthly_impact: a.monthly_impact || 0,
      })),
      latestReport
    );

    // Calculate ROI (plan cost in cents/month vs recovered)
    const PLAN_COSTS: Record<string, number> = {
      free: 0,
      pro: 29900, // $299/yr ÷ 12 = $24.92/mo ≈ 2492 cents
      team: 49900, // $499/yr ÷ 12 = $41.58/mo ≈ 4158 cents
    };
    const monthlyCost = (PLAN_COSTS[plan] || 0) / 12;
    const roi =
      monthlyCost > 0
        ? Math.round((impact.totalRecovered / monthlyCost) * 10) / 10
        : 0;

    // Recovery rate
    const totalActions = impact.recoveredActions.length + impact.stillOpen;
    const recoveryRate =
      totalActions > 0
        ? Math.round((impact.recoveredActions.length / totalActions) * 100)
        : 0;

    // Recent executed actions for timeline
    const recentActions = executedActions
      .sort(
        (a, b) =>
          new Date(b.executed_at || 0).getTime() -
          new Date(a.executed_at || 0).getTime()
      )
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        actionType: a.action_type,
        customerId: a.customer_id,
        monthlyImpact: a.monthly_impact,
        executedAt: a.executed_at,
      }));

    return NextResponse.json({
      totalRecoveredMonthly: impact.totalRecovered,
      totalRecoveredAnnual: impact.totalRecoveredAnnual,
      recoveryRate,
      totalExecuted: executedActions.length,
      totalRecovered: impact.recoveredActions.length,
      totalStillOpen: impact.stillOpen,
      recoveredActions: impact.recoveredActions,
      roi,
      recentActions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error(`Error: ${message}`);
    return NextResponse.json(
      { error: "Failed to fetch recovery stats" },
      { status: 500 }
    );
  }
}
