import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Json } from "@/lib/supabase/types";

const ACTION_LABELS: Record<string, string> = {
  scan_run: "Ran a scan",
  report_viewed: "Viewed report",
  report_exported: "Exported report",
  action_approved: "Approved recovery action",
  action_dismissed: "Dismissed recovery action",
  action_executed: "Executed recovery action",
  action_failed: "Recovery action failed",
  leak_dismissed: "Dismissed leak",
  plan_upgraded: "Upgraded plan",
  plan_cancelled: "Cancelled plan",
  plan_reactivated: "Reactivated plan",
  settings_updated: "Updated settings",
  auto_scan_enabled: "Enabled auto-scan",
  auto_scan_disabled: "Disabled auto-scan",
  team_member_invited: "Invited team member",
  team_member_removed: "Removed team member",
  billing_portal_opened: "Opened billing portal",
  api_key_submitted: "Submitted API key",
  login: "Signed in",
  signup: "Created account",
};

const ACTION_ICONS: Record<string, string> = {
  scan_run: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  report_viewed: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z",
  report_exported: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  action_approved: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  action_dismissed: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  action_executed: "M5 13l4 4L19 7",
  action_failed: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  plan_upgraded: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
  plan_cancelled: "M6 18L18 6M6 6l12 12",
  settings_updated: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
  team_member_invited: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z",
  billing_portal_opened: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  login: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function AuditLogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/audit");
  }

  // Check plan — audit log is Team only
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "team") {
    redirect("/dashboard");
  }

  // Fetch audit log entries (last 100)
  const { data: entries } = await supabase
    .from("audit_log")
    .select("id, user_id, action, resource, resource_id, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch team member emails for display
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("member_id, member_email")
    .eq("team_owner_id", user.id)
    .eq("invite_status", "accepted");

  const emailMap = new Map<string, string>();
  emailMap.set(user.id, user.email || "You");
  if (teamMembers) {
    for (const m of teamMembers) {
      if (m.member_id) emailMap.set(m.member_id, m.member_email);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-text-muted mt-1">
          Track all actions taken in your account
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        {!entries || entries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-surface-dim rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-text-dim"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <p className="text-text-muted text-sm">
              No audit events yet. Actions will appear here as your team uses
              RevReclaim.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map(
              (entry: {
                id: string;
                user_id: string | null;
                action: string;
                resource: string | null;
                resource_id: string | null;
                metadata: Json;
                created_at: string;
              }) => {
                const label =
                  ACTION_LABELS[entry.action] || entry.action;
                const iconPath =
                  ACTION_ICONS[entry.action] ||
                  ACTION_ICONS["settings_updated"];
                const actorEmail =
                  (entry.user_id && emailMap.get(entry.user_id)) || "Unknown";
                const meta = entry.metadata as Record<
                  string,
                  unknown
                > | null;

                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 px-5 py-4 hover:bg-surface-dim/50 transition"
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-surface-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={iconPath}
                        />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-dim">
                          {actorEmail}
                        </span>
                        {entry.resource && (
                          <>
                            <span className="text-xs text-text-dim">
                              &middot;
                            </span>
                            <span className="text-xs text-text-dim">
                              {entry.resource}
                              {entry.resource_id
                                ? `: ${entry.resource_id.slice(0, 8)}...`
                                : ""}
                            </span>
                          </>
                        )}
                        {meta &&
                          Object.keys(meta).length > 0 && (
                            <span className="text-xs text-text-dim">
                              &middot;{" "}
                              {Object.entries(meta)
                                .slice(0, 2)
                                .map(
                                  ([k, v]) =>
                                    `${k}: ${String(v).slice(0, 20)}`
                                )
                                .join(", ")}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Time */}
                    <span className="text-xs text-text-dim whitespace-nowrap flex-shrink-0">
                      {formatRelativeTime(entry.created_at)}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
