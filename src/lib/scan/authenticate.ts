/**
 * Scan Authentication & Plan Enforcement
 *
 * Handles user authentication, plan checks, and disabled-account guards
 * for the scan API route.
 */

import { createClient } from "@/lib/supabase/server";
import { canRunScan } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { sendScanLimitReachedEmail } from "@/lib/email";
import { fireAndForget } from "@/lib/fire-and-forget";
import { createLogger } from "@/lib/logger";

const log = createLogger("SCAN_AUTH");

export interface AuthResult {
  userId: string | null;
  /** If set, the scan should be blocked and this error returned */
  blockResponse: {
    error: string;
    errorType?: string;
    status: number;
  } | null;
}

/**
 * Authenticate the user and enforce plan limits.
 * Returns the user ID (or null for anonymous) and an optional block response.
 */
export async function authenticateAndCheckPlan(
  email: string
): Promise<AuthResult> {
  let userId: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { userId: null, blockResponse: null };
    }

    userId = authUser.id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, scan_count_this_period, is_disabled")
      .eq("id", authUser.id)
      .single();

    if (!profile) {
      return { userId, blockResponse: null };
    }

    // Kill switch: block disabled users instantly
    if (profile.is_disabled) {
      return {
        userId,
        blockResponse: {
          error:
            "Your account has been suspended. Please contact support.",
          status: 403,
        },
      };
    }

    const plan = (profile.plan || "free") as PlanType;
    const scanCount = profile.scan_count_this_period ?? 0;
    const scanCheck = canRunScan(plan, scanCount);

    if (!scanCheck.allowed) {
      fireAndForget(
        sendScanLimitReachedEmail(email),
        "SCAN_LIMIT_EMAIL"
      );
      return {
        userId,
        blockResponse: {
          error: scanCheck.reason!,
          errorType: "plan_limit",
          status: 403,
        },
      };
    }

    return { userId, blockResponse: null };
  } catch {
    // Plan check is non-blocking for unauthenticated users
    log.warn("Auth check failed, proceeding as anonymous");
    return { userId, blockResponse: null };
  }
}
