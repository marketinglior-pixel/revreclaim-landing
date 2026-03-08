import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";
import { createLogger } from "@/lib/logger";

const log = createLogger("ANALYTICS");

/**
 * Analytics event tracking — fire-and-forget server-side analytics.
 * Uses service-role client to bypass RLS.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServiceClient() {
  return createClient<Database>(supabaseUrl, serviceRoleKey);
}

export type AnalyticsEvent =
  | "scan_started"
  | "scan_completed"
  | "plan_upgraded"
  | "plan_cancelled"
  | "plan_reactivated"
  | "auto_scan_enabled"
  | "team_member_invited"
  | "checkout_started"
  | "billing_portal_opened"
  | "page_view"
  | "section_viewed"
  | "cta_clicked"
  | "newsletter_signup"
  | "action_executed"
  | "action_failed";

/**
 * Track an analytics event. Fire-and-forget — errors are logged but never thrown.
 */
export async function trackEvent(
  eventName: AnalyticsEvent,
  userId: string | null,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      log.warn("Missing Supabase credentials, skipping event:", eventName);
      return;
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from("analytics_events").insert({
      event_name: eventName,
      user_id: userId,
      event_data: (data as Json) || null,
    });

    if (error) {
      log.error("Failed to track event:", eventName, error.message);
    }
  } catch (err) {
    log.error("Unexpected error tracking event:", eventName, err);
  }
}
