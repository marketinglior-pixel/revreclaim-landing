import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Monthly Digest Email for Free Users
 *
 * Sends a billing health summary to all users who have scanned at least once.
 * Estimated health degradation based on time since last scan.
 * Goal: re-engage free users by pulling them back for a re-scan.
 *
 * Triggered by external cron (e.g., Vercel Cron) once per month.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with at least one report, who are on free plan
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, plan")
      .eq("plan", "free")
      .eq("is_disabled", false);

    if (error || !users) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    let sent = 0;

    for (const user of users) {
      // Get their latest report
      const { data: reports } = await supabase
        .from("reports")
        .select("id, created_at, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!reports || reports.length === 0) continue;

      const latestReport = reports[0];
      const summary = latestReport.summary as {
        mrrAtRisk?: number;
        leaksFound?: number;
        healthScore?: number;
      } | null;

      if (!summary) continue;

      const healthScore = summary.healthScore ?? 50;
      const mrrAtRisk = summary.mrrAtRisk ? Math.round(summary.mrrAtRisk / 100) : 0;
      const leaksFound = summary.leaksFound ?? 0;

      // Estimate degradation: ~2-5 points per month without scanning
      const lastScanDate = new Date(latestReport.created_at);
      const daysSinceScan = Math.floor(
        (Date.now() - lastScanDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const estimatedDegradation = Math.min(
        15,
        Math.floor(daysSinceScan / 30) * 3
      );
      const estimatedScore = Math.max(0, healthScore - estimatedDegradation);

      // Send email via Resend
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) continue;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "RevReclaim <digest@revreclaim.com>",
          to: user.email,
          subject: `Your Billing Health: ${estimatedScore}/100${estimatedDegradation > 0 ? ` (down ${estimatedDegradation} points)` : ""}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
              <h2 style="color:#000;">Monthly Billing Health Update</h2>

              <div style="background:${estimatedScore >= 60 ? "#f0fdf4" : "#fef2f2"};border:1px solid ${estimatedScore >= 60 ? "#bbf7d0" : "#fecaca"};border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
                <p style="margin:0;font-size:14px;color:#666;">Billing Health Score</p>
                <p style="margin:4px 0 0;font-size:36px;font-weight:bold;color:${estimatedScore >= 60 ? "#16a34a" : "#dc2626"};">${estimatedScore}/100</p>
                ${estimatedDegradation > 0 ? `<p style="margin:4px 0 0;font-size:13px;color:#dc2626;">Down ${estimatedDegradation} points since last scan</p>` : ""}
              </div>

              <p><strong>Last scan:</strong> ${daysSinceScan} days ago</p>
              <p><strong>Revenue at risk:</strong> $${mrrAtRisk}/mo (${leaksFound} leaks found)</p>
              ${daysSinceScan > 30 ? `<p style="color:#dc2626;">New leaks may have appeared since your last scan. Failed payments, expiring cards, and billing changes happen every week.</p>` : ""}

              <p style="margin-top:24px;">
                <a href="https://revreclaim.com/scan"
                   style="display:inline-block;background:#10b981;color:#000;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px;">
                  Re-Scan Now (Free)
                </a>
              </p>

              <p style="font-size:12px;color:#999;margin-top:24px;">
                You're receiving this because you have a RevReclaim account.
                <a href="https://revreclaim.com/dashboard/settings">Manage notifications</a>
              </p>
            </div>
          `,
        }),
      });

      sent++;
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", details: String(err) },
      { status: 500 }
    );
  }
}
