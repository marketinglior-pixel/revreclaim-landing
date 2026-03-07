import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canUseRecoveryActions } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { executeAction } from "@/lib/recovery/executor";
import type { RecoveryAction } from "@/lib/recovery/types";
import { trackEvent } from "@/lib/analytics";

/**
 * POST /api/actions/execute — Execute a single approved action.
 * Body: { actionId: string }
 *
 * Decrypts customer email, performs the action (send dunning email, etc.),
 * and updates status to "executed" or "failed".
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 20 executions per IP per hour
    const ip = getClientIP(req);
    const rl = rateLimit({ name: "actions-execute", maxRequests: 20, windowSeconds: 3600 }, ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Plan enforcement
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, is_disabled")
      .eq("id", user.id)
      .single();

    if (profile?.is_disabled) {
      return NextResponse.json(
        { error: "Your account has been suspended." },
        { status: 403 }
      );
    }

    const userPlan = (profile?.plan || "free") as PlanType;
    const canUse = canUseRecoveryActions(userPlan);
    if (!canUse.allowed) {
      return NextResponse.json(
        { error: canUse.reason, errorType: "plan_limit" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { actionId } = body;

    if (!actionId || typeof actionId !== "string") {
      return NextResponse.json(
        { error: "Provide an action ID." },
        { status: 400 }
      );
    }

    // Fetch the action — must belong to this user and be in "approved" status
    const { data: actionRow, error: fetchError } = await supabase
      .from("recovery_actions")
      .select("*")
      .eq("id", actionId)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();

    if (fetchError || !actionRow) {
      return NextResponse.json(
        { error: "Action not found or not in approved status." },
        { status: 404 }
      );
    }

    // Cast to our typed interface
    const action = actionRow as unknown as RecoveryAction;

    console.log(
      `[EXECUTE] Executing action ${actionId} (${action.action_type}) for user ${user.id}`
    );

    // Execute the action
    const result = await executeAction(action);

    const now = new Date().toISOString();

    if (result.success) {
      // Mark as executed
      await supabase
        .from("recovery_actions")
        .update({
          status: "executed",
          executed_at: now,
        })
        .eq("id", actionId);

      console.log(`[EXECUTE] Action ${actionId} executed successfully`);

      // Track event (fire-and-forget)
      trackEvent("action_executed", user.id, {
        actionId,
        actionType: action.action_type,
        monthlyImpact: action.monthly_impact,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        actionId,
        status: "executed",
      });
    } else {
      // Mark as failed with error message
      await supabase
        .from("recovery_actions")
        .update({
          status: "failed",
          error_message: result.error || "Unknown error",
        })
        .eq("id", actionId);

      console.error(`[EXECUTE] Action ${actionId} failed: ${result.error}`);

      trackEvent("action_failed", user.id, {
        actionId,
        actionType: action.action_type,
        error: result.error,
      }).catch(() => {});

      return NextResponse.json({
        success: false,
        actionId,
        status: "failed",
        error: result.error,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed";
    console.error(`[EXECUTE] Error: ${message}`);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
