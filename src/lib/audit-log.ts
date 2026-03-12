/**
 * Audit Log — fire-and-forget logging of user actions.
 *
 * Tracks who did what and when, for compliance and debugging.
 * Uses service-role client to bypass RLS.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";
import { createLogger } from "@/lib/logger";

const log = createLogger("AUDIT");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getServiceClient() {
  return createClient<Database>(supabaseUrl, serviceRoleKey);
}

export type AuditAction =
  | "scan_run"
  | "report_viewed"
  | "report_exported"
  | "action_approved"
  | "action_dismissed"
  | "action_executed"
  | "action_failed"
  | "leak_dismissed"
  | "plan_upgraded"
  | "plan_cancelled"
  | "plan_reactivated"
  | "settings_updated"
  | "auto_scan_enabled"
  | "auto_scan_disabled"
  | "team_member_invited"
  | "team_member_removed"
  | "billing_portal_opened"
  | "api_key_submitted"
  | "hubspot_connected"
  | "hubspot_disconnected"
  | "login"
  | "signup";

export type AuditResource =
  | "report"
  | "action"
  | "leak"
  | "subscription"
  | "team_member"
  | "settings"
  | "scan_config"
  | "integration"
  | "profile";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event. Fire-and-forget — errors are logged but never thrown.
 */
export async function logAudit({
  userId,
  action,
  resource,
  resourceId,
  metadata,
}: AuditEntry): Promise<void> {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      log.warn("Missing Supabase credentials, skipping audit:", action);
      return;
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      resource: resource || null,
      resource_id: resourceId || null,
      metadata: (metadata as Json) || null,
    });

    if (error) {
      log.error("Failed to log audit event:", action, error.message);
    }
  } catch (err) {
    log.error("Unexpected audit log error:", action, err);
  }
}
