import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canUseRecoveryActions } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { guardMutation } from "@/lib/api-security";

/**
 * GET /api/actions — Fetch user's recovery actions.
 * Supports filters: ?status=pending&report_id=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const reportId = searchParams.get("report_id");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("recovery_actions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }
    if (reportId) {
      query = query.eq("report_id", reportId);
    }

    const { data: actions, error, count } = await query;

    if (error) {
      console.error("[ACTIONS] Fetch error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch actions" },
        { status: 500 }
      );
    }

    // Check plan for gating info
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const userPlan = (profile?.plan || "free") as PlanType;

    // Count executed actions for plan limit enforcement
    const { count: executedCount } = await supabase
      .from("recovery_actions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "executed");

    const canUse = canUseRecoveryActions(userPlan, executedCount ?? 0);

    return NextResponse.json({
      actions: actions || [],
      total: count || 0,
      canApprove: canUse.allowed,
      plan: userPlan,
      executedCount: executedCount ?? 0,
      remaining: canUse.remaining,
    });
  } catch (error) {
    console.error("[ACTIONS] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/actions — Approve or dismiss actions.
 * Body: { actionIds: string[], decision: "approve" | "dismiss" }
 */
export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    // Rate limit: 30 action updates per IP per hour
    const ip = getClientIP(req);
    const rl = await rateLimit({ name: "actions", maxRequests: 30, windowSeconds: 3600 }, ip);
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

    // Count executed actions for plan limit enforcement
    const { count: executedCount } = await supabase
      .from("recovery_actions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "executed");

    const canUse = canUseRecoveryActions(userPlan, executedCount ?? 0);
    if (!canUse.allowed) {
      return NextResponse.json(
        { error: canUse.reason, errorType: "plan_limit" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { actionIds, decision } = body;

    if (
      !actionIds ||
      !Array.isArray(actionIds) ||
      actionIds.length === 0 ||
      actionIds.length > 50
    ) {
      return NextResponse.json(
        { error: "Provide 1-50 action IDs." },
        { status: 400 }
      );
    }

    if (!["approve", "dismiss", "retry"].includes(decision)) {
      return NextResponse.json(
        { error: "Decision must be 'approve', 'dismiss', or 'retry'." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Determine the status transition
    let fromStatus: string;
    let newStatus: string;
    const updateData: Record<string, unknown> = {};

    if (decision === "retry") {
      // Move failed actions back to approved for re-execution
      fromStatus = "failed";
      newStatus = "approved";
      updateData.status = newStatus;
      updateData.error_message = null;
      updateData.approved_at = now;
    } else {
      fromStatus = "pending";
      newStatus = decision === "approve" ? "approved" : "dismissed";
      updateData.status = newStatus;
      if (decision === "approve") {
        updateData.approved_at = now;
      }
    }

    // Update only actions belonging to this user and in the expected status
    const { data: updated, error: updateError } = await supabase
      .from("recovery_actions")
      .update(updateData)
      .eq("user_id", user.id)
      .eq("status", fromStatus)
      .in("id", actionIds)
      .select("id, status");

    if (updateError) {
      console.error("[ACTIONS] Update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update actions" },
        { status: 500 }
      );
    }

    console.log(
      `[ACTIONS] User ${user.id} ${decision}d ${updated?.length || 0} actions`
    );

    return NextResponse.json({
      updated: updated?.length || 0,
      decision,
    });
  } catch (error) {
    console.error("[ACTIONS] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
