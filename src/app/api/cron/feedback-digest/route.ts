import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { verifyCronSecret } from "@/lib/api-security";
import { Resend } from "resend";
import { createLogger } from "@/lib/logger";

const log = createLogger("FEEDBACK-DIGEST");

export const maxDuration = 60;

const SURVEY_EVENTS = ["post_scan_survey", "post_fix_survey", "nps_survey", "feedback_widget"];
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
const FROM = process.env.EMAIL_FROM || "RevReclaim <noreply@revreclaim.com>";

type EventRow = {
  id: string;
  event_name: string;
  user_id: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (ADMIN_EMAILS.length === 0) {
    log.warn("No ADMIN_EMAILS configured, skipping digest");
    return NextResponse.json({ ok: true, skipped: true, reason: "no_admin_emails" });
  }

  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*")
      .in("event_name", SURVEY_EVENTS)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) {
      log.error("Failed to query events:", error.message);
      return NextResponse.json({ error: "DB query failed" }, { status: 500 });
    }

    const rows = (events || []) as unknown as EventRow[];

    if (rows.length === 0) {
      log.info("No new feedback in last 24h, skipping digest");
      return NextResponse.json({ ok: true, skipped: true, reason: "no_new_feedback" });
    }

    // Build digest
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.event_name] = (counts[row.event_name] || 0) + 1;
    }

    const npsScores = rows
      .filter((r) => r.event_name === "nps_survey")
      .map((r) => (r.event_data as Record<string, unknown>)?.score as number)
      .filter((s) => typeof s === "number");

    const avgNps = npsScores.length > 0
      ? (npsScores.reduce((a, b) => a + b, 0) / npsScores.length).toFixed(1)
      : null;

    const lowNps = npsScores.filter((s) => s <= 6);

    const bugs = rows.filter(
      (r) => r.event_name === "feedback_widget" && (r.event_data as Record<string, unknown>)?.category === "bug"
    );

    const html = buildDigestHtml(rows, counts, avgNps, lowNps, bugs);

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAILS,
      subject: `Feedback Digest: ${rows.length} new response${rows.length === 1 ? "" : "s"} today`,
      html,
    });

    log.info(`Sent feedback digest: ${rows.length} responses to ${ADMIN_EMAILS.length} admin(s)`);
    return NextResponse.json({ ok: true, sent: rows.length });
  } catch (err) {
    log.error("Feedback digest failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildDigestHtml(
  rows: EventRow[],
  counts: Record<string, number>,
  avgNps: string | null,
  lowNps: number[],
  bugs: EventRow[]
): string {
  const countLines = Object.entries(counts)
    .map(([name, count]) => `<li><strong>${name.replace(/_/g, " ")}</strong>: ${count}</li>`)
    .join("");

  const npsSection = avgNps
    ? `<h3>NPS</h3><p>Average: <strong>${avgNps}/10</strong> (${lowNps.length} detractor${lowNps.length === 1 ? "" : "s"})</p>`
    : "";

  const bugSection = bugs.length > 0
    ? `<h3>Bug Reports (${bugs.length})</h3><ul>${bugs.map((b) => {
        const d = b.event_data as Record<string, unknown>;
        return `<li>"${d?.feedback || "No details"}" — ${d?.email || "anonymous"} (${d?.page_path || "/"})</li>`;
      }).join("")}</ul>`
    : "";

  const feedbackItems = rows.slice(0, 20).map((r) => {
    const d = r.event_data as Record<string, unknown>;
    const type = r.event_name.replace(/_/g, " ");
    let detail = "";
    if (r.event_name === "nps_survey") detail = `Score: ${d?.score}/10${d?.reason ? ` — "${d.reason}"` : ""}`;
    else if (r.event_name === "feedback_widget") detail = `[${d?.category}] "${d?.feedback || ""}"`;
    else if (r.event_name === "post_scan_survey") detail = `MRR: ${d?.mrr_range}${d?.nps_score ? `, NPS: ${d.nps_score}` : ""}`;
    else if (r.event_name === "post_fix_survey") detail = `Fix: ${d?.fix_status}${d?.suggestion ? ` — "${d.suggestion}"` : ""}`;
    return `<tr><td style="padding:4px 8px;border-bottom:1px solid #333;font-size:12px;color:#999;">${new Date(r.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td><td style="padding:4px 8px;border-bottom:1px solid #333;font-size:12px;color:#10B981;font-weight:600;">${type}</td><td style="padding:4px 8px;border-bottom:1px solid #333;font-size:12px;color:#ccc;">${detail}</td></tr>`;
  }).join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e5e5e5;padding:24px;border-radius:12px;">
      <h2 style="color:#10B981;margin-bottom:4px;">Feedback Digest</h2>
      <p style="color:#888;font-size:13px;margin-top:0;">Last 24 hours — ${rows.length} new response${rows.length === 1 ? "" : "s"}</p>

      <h3 style="color:#fff;font-size:14px;">Summary</h3>
      <ul style="font-size:13px;color:#ccc;padding-left:20px;">${countLines}</ul>

      ${npsSection}
      ${bugSection}

      <h3 style="color:#fff;font-size:14px;">Recent Responses</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${feedbackItems}
      </table>

      <p style="color:#666;font-size:11px;margin-top:24px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://revreclaim.com"}/dashboard/feedback" style="color:#10B981;">View full dashboard &rarr;</a>
      </p>
    </div>
  `;
}
