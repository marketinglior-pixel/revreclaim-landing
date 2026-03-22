import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canUseRecoveryActions } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { executeAction } from "@/lib/recovery/executor";
import type { RecoveryAction } from "@/lib/recovery/types";
import { trackEvent } from "@/lib/analytics";
import { decrypt } from "@/lib/encryption";
import { guardMutation } from "@/lib/api-security";
import { fireAndForget } from "@/lib/fire-and-forget";
import { getWebhookConfig, sendWebhookNotification } from "@/lib/notifications/webhook";
import { createLogger } from "@/lib/logger";
import { logAudit } from "@/lib/audit-log";

const log = createLogger("EXECUTE");

/**
 * POST /api/actions/execute — Execute a single approved action.
 * Body: { actionId: string }
 *
 * Decrypts customer email, performs the action (send dunning email, etc.),
 * and updates status to "executed" or "failed".
 */
export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    // Rate limit: 20 executions per IP per hour
    const ip = getClientIP(req);
    const rl = await rateLimit({ name: "actions-execute", maxRequests: 20, windowSeconds: 3600 }, ip);
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

    // Count executed actions for plan limit enforcement (prevents race conditions)
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
    const { actionId } = body;

    if (!actionId || typeof actionId !== "string") {
      return NextResponse.json(
        { error: "Provide an action ID." },
        { status: 400 }
      );
    }

    // Pre-flight: check if write action has a required API key BEFORE claiming
    // This prevents the action from being marked as "failed" just because the
    // user hasn't added an Action API Key yet. The action stays "approved" so
    // the user can retry after adding the key — no need to hunt in the Failed tab.
    // Fetch action — accept both "pending" and "approved" for one-click fix
    const { data: actionRow } = await supabase
      .from("recovery_actions")
      .select("action_type, status")
      .eq("id", actionId)
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .single();

    if (!actionRow) {
      // Check if already executed (idempotent response)
      const { data: existing } = await supabase
        .from("recovery_actions")
        .select("status")
        .eq("id", actionId)
        .eq("user_id", user.id)
        .single();

      if (existing?.status === "executed" || existing?.status === "executing") {
        return NextResponse.json({
          success: true,
          actionId,
          status: "executed",
          message: "Action was already executed.",
        });
      }

      return NextResponse.json(
        { error: "Action not found or not ready for execution." },
        { status: 404 }
      );
    }

    // Auto-approve pending actions (one-click fix flow)
    if (actionRow.status === "pending") {
      await supabase
        .from("recovery_actions")
        .update({ status: "approved" as string })
        .eq("id", actionId)
        .eq("user_id", user.id);
    }

    const isWriteAction = ["retry_payment", "remove_coupon", "cancel_subscription"].includes(
      actionRow.action_type
    );

    // For write actions, fetch and decrypt the action API key
    let actionApiKey: string | null = null;

    if (isWriteAction) {
      const { data: scanConfig } = await supabase
        .from("scan_configs")
        .select("action_api_key_encrypted")
        .eq("user_id", user.id)
        .single();

      if (!scanConfig?.action_api_key_encrypted) {
        // Return error WITHOUT changing action status — it stays "approved"
        return NextResponse.json(
          {
            error: "Action API Key required. Go to Settings → Action API Key to add a write-capable key for your billing platform.",
            errorType: "missing_api_key",
          },
          { status: 400 }
        );
      }

      try {
        actionApiKey = decrypt(scanConfig.action_api_key_encrypted);
      } catch {
        return NextResponse.json(
          { error: "Failed to decrypt Action API Key. Please re-save it in Settings." },
          { status: 400 }
        );
      }
    }

    // Atomically claim the action: update status from "approved" → "executing"
    // This prevents double execution if two requests arrive simultaneously
    const { data: claimedRows, error: claimError } = await supabase
      .from("recovery_actions")
      .update({ status: "executing" as string })
      .eq("id", actionId)
      .eq("user_id", user.id)
      .eq("status", "approved")
      .select("*");

    if (claimError) {
      return NextResponse.json(
        { error: "Failed to claim action for execution." },
        { status: 500 }
      );
    }

    if (!claimedRows || claimedRows.length === 0) {
      return NextResponse.json(
        { error: "Action was already claimed by another request." },
        { status: 409 }
      );
    }

    // Cast to our typed interface
    const action = claimedRows[0] as unknown as RecoveryAction;

    log.info(
      `Executing action ${actionId} (${action.action_type}) for user ${user.id}`
    );

    // Execute the action
    const result = await executeAction(action, actionApiKey);

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

      log.info(`Action ${actionId} executed successfully`);

      // Track event + audit log (fire-and-forget)
      fireAndForget(trackEvent("action_executed", user.id, {
        actionId,
        actionType: action.action_type,
        monthlyImpact: action.monthly_impact,
      }), "ACTION_EXECUTED_TRACKING");
      fireAndForget(logAudit({
        userId: user.id,
        action: "action_executed",
        resource: "action",
        resourceId: actionId,
        metadata: { actionType: action.action_type, monthlyImpact: action.monthly_impact },
      }), "ACTION_EXECUTED_AUDIT");

      // Send webhook notification (fire-and-forget)
      fireAndForget(
        (async () => {
          const webhookConfig = await getWebhookConfig(user.id);
          if (webhookConfig) {
            await sendWebhookNotification(webhookConfig.url, webhookConfig.secret, "action_executed", {
              actionId,
              actionType: action.action_type,
              customerId: action.customer_id,
              monthlyImpact: action.monthly_impact,
              status: "executed",
            });
          }
        })(),
        "ACTION_EXECUTED_WEBHOOK"
      );

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

      log.error(`Action ${actionId} failed: ${result.error}`);

      fireAndForget(trackEvent("action_failed", user.id, {
        actionId,
        actionType: action.action_type,
        error: result.error,
      }), "ACTION_FAILED_TRACKING");
      fireAndForget(logAudit({
        userId: user.id,
        action: "action_failed",
        resource: "action",
        resourceId: actionId,
        metadata: { actionType: action.action_type, error: result.error },
      }), "ACTION_FAILED_AUDIT");

      // Send webhook notification for failure (fire-and-forget)
      fireAndForget(
        (async () => {
          const webhookConfig = await getWebhookConfig(user.id);
          if (webhookConfig) {
            await sendWebhookNotification(webhookConfig.url, webhookConfig.secret, "action_failed", {
              actionId,
              actionType: action.action_type,
              customerId: action.customer_id,
              monthlyImpact: action.monthly_impact,
              status: "failed",
              error: result.error,
            });
          }
        })(),
        "ACTION_FAILED_WEBHOOK"
      );

      return NextResponse.json({
        success: false,
        actionId,
        status: "failed",
        error: result.error,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed";
    log.error(`Error: ${message}`);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
