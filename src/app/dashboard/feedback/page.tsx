import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Feedback Dashboard | RevReclaim",
  description: "View and analyze user feedback, NPS scores, and survey responses.",
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const SURVEY_EVENTS = ["post_scan_survey", "post_fix_survey", "nps_survey", "feedback_widget"] as const;

type EventRow = {
  id: string;
  event_name: string;
  user_id: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
};

const EVENT_BADGES: Record<string, { label: string; color: string }> = {
  post_scan_survey: { label: "Post-Scan", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  post_fix_survey: { label: "Post-Fix", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  nps_survey: { label: "NPS", color: "bg-brand/15 text-brand border-brand/30" },
  feedback_widget: { label: "Feedback", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getDetailText(event: EventRow): string {
  const d = event.event_data || {};
  switch (event.event_name) {
    case "post_scan_survey":
      return [
        d.mrr_range && `MRR: ${d.mrr_range}`,
        d.nps_score != null && `NPS: ${d.nps_score}`,
        d.feedback && `"${d.feedback}"`,
      ].filter(Boolean).join(" | ");
    case "post_fix_survey":
      return [
        d.fix_status && `Fix: ${d.fix_status}`,
        d.time_taken && `Time: ${d.time_taken}`,
        d.suggestion && `"${d.suggestion}"`,
      ].filter(Boolean).join(" | ");
    case "nps_survey":
      return [
        d.score != null && `Score: ${d.score}/10`,
        d.reason && `"${d.reason}"`,
        d.referral_email && `Referral: ${d.referral_email}`,
      ].filter(Boolean).join(" | ");
    case "feedback_widget":
      return [
        d.category && `[${d.category}]`,
        d.feedback && `"${d.feedback}"`,
        d.email && `From: ${d.email}`,
      ].filter(Boolean).join(" | ");
    default:
      return JSON.stringify(d);
  }
}

export default async function FeedbackDashboardPage() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
    redirect("/dashboard");
  }

  // Service-role client for querying all events
  const serviceClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const { data: events } = await serviceClient
    .from("analytics_events")
    .select("*")
    .in("event_name", [...SURVEY_EVENTS])
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (events || []) as unknown as EventRow[];

  // Stats
  const totalResponses = rows.length;
  const now = new Date();
  const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = rows.filter((r) => new Date(r.created_at).getTime() > oneWeekAgo).length;

  // NPS scores from nps_survey + post_scan_survey
  const npsScores = rows
    .map((r) => {
      if (r.event_name === "nps_survey") return (r.event_data as Record<string, unknown>)?.score as number | undefined;
      if (r.event_name === "post_scan_survey") return (r.event_data as Record<string, unknown>)?.nps_score as number | undefined;
      return undefined;
    })
    .filter((s): s is number => s != null && typeof s === "number");

  const avgNps = npsScores.length > 0 ? (npsScores.reduce((a, b) => a + b, 0) / npsScores.length) : null;

  const bugCount = rows.filter(
    (r) => r.event_name === "feedback_widget" && (r.event_data as Record<string, unknown>)?.category === "bug"
  ).length;

  // NPS distribution for chart
  const npsDistribution = Array.from({ length: 11 }, (_, i) => ({
    score: i,
    count: npsScores.filter((s) => Math.round(s) === i).length,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Feedback Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          All survey responses and feedback from users. Updated in real-time.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Responses" value={totalResponses.toString()} />
        <StatCard label="This Week" value={thisWeek.toString()} trend={thisWeek > 0 ? "up" : undefined} />
        <StatCard
          label="Avg NPS"
          value={avgNps != null ? avgNps.toFixed(1) : "—"}
          color={avgNps != null ? (avgNps >= 8 ? "text-brand" : avgNps >= 6 ? "text-yellow-400" : "text-danger") : undefined}
        />
        <StatCard label="Bug Reports" value={bugCount.toString()} color={bugCount > 0 ? "text-danger" : undefined} />
      </div>

      {/* NPS Distribution */}
      {npsScores.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-bold text-white mb-4">NPS Score Distribution</h2>
          <div className="flex items-end gap-1.5 h-32">
            {npsDistribution.map((d) => {
              const maxCount = Math.max(...npsDistribution.map((x) => x.count), 1);
              const height = d.count > 0 ? Math.max((d.count / maxCount) * 100, 8) : 4;
              const color = d.score <= 6 ? "bg-danger/60" : d.score <= 8 ? "bg-yellow-500/60" : "bg-brand/60";
              return (
                <div key={d.score} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-text-dim">{d.count || ""}</span>
                  <div
                    className={`w-full rounded-t ${color} transition-all`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-text-dim">{d.score}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-text-dim">Detractors (0-6)</span>
            <span className="text-[10px] text-text-dim">Passives (7-8)</span>
            <span className="text-[10px] text-text-dim">Promoters (9-10)</span>
          </div>
        </div>
      )}

      {/* Response breakdown by type */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SURVEY_EVENTS.map((eventName) => {
          const count = rows.filter((r) => r.event_name === eventName).length;
          const badge = EVENT_BADGES[eventName];
          return (
            <div key={eventName} className="rounded-xl border border-border bg-surface p-4">
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${badge.color}`}>
                {badge.label}
              </span>
              <p className="text-xl font-bold text-white mt-2">{count}</p>
              <p className="text-[11px] text-text-dim">responses</p>
            </div>
          );
        })}
      </div>

      {/* Response table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-white">All Responses</h2>
          <p className="text-xs text-text-dim mt-0.5">Latest 500 responses, newest first</p>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-text-muted">No survey responses yet.</p>
            <p className="text-xs text-text-dim mt-1">Responses will appear here as users submit surveys.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((event) => {
              const badge = EVENT_BADGES[event.event_name] || { label: event.event_name, color: "bg-surface-dim text-text-muted border-border" };
              const detail = getDetailText(event);
              return (
                <div key={event.id} className="px-6 py-3 flex items-start gap-4 hover:bg-surface-dim/50 transition">
                  {/* Date */}
                  <span className="text-[11px] text-text-dim whitespace-nowrap min-w-[100px]">
                    {formatDate(event.created_at)}
                  </span>

                  {/* Badge */}
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border whitespace-nowrap ${badge.color}`}>
                    {badge.label}
                  </span>

                  {/* User */}
                  <span className="text-[11px] text-text-muted whitespace-nowrap min-w-[70px]">
                    {event.user_id ? event.user_id.slice(0, 8) + "..." : "anon"}
                  </span>

                  {/* Detail */}
                  <span className="text-xs text-text-secondary flex-1 min-w-0 truncate">
                    {detail || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  trend,
}: {
  label: string;
  value: string;
  color?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-[11px] text-text-dim font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className={`text-2xl font-bold ${color || "text-white"}`}>{value}</p>
        {trend === "up" && (
          <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
