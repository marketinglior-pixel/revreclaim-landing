import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendReminderEmail, sendUpgradeNudgeEmail } from "@/lib/email";

export const maxDuration = 60;

/**
 * Daily cron job for email sequences:
 * 1. Remind users who signed up 24h ago but never scanned
 * 2. Nudge free users to upgrade 7 days after their first scan
 *
 * Security: Protected by CRON_SECRET bearer token.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[EMAIL CRON] Daily email sequences started");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  let remindersSent = 0;
  let nudgesSent = 0;

  // 1. Remind users who signed up ~24h ago but never scanned
  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 28); // 28h ago
    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setHours(dayBeforeYesterday.getHours() - 20); // 20h ago

    const { data: newUsers } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("plan", "free")
      .gte("created_at", yesterday.toISOString())
      .lte("created_at", dayBeforeYesterday.toISOString());

    if (newUsers && newUsers.length > 0) {
      for (const user of newUsers) {
        // Check if they have any reports
        const { count } = await supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (!count || count === 0) {
          await sendReminderEmail(user.email);
          remindersSent++;
          console.log(`[EMAIL CRON] Reminder sent to ${user.email}`);
        }
      }
    }
  } catch (err) {
    console.error("[EMAIL CRON] Error sending reminders:", err);
  }

  // 2. Nudge free users to upgrade 7 days after first scan
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    // Find free users whose oldest report is ~7 days old
    const { data: freeUsers } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("plan", "free");

    if (freeUsers) {
      for (const user of freeUsers) {
        const { data: reports } = await supabase
          .from("reports")
          .select("created_at, summary")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1);

        if (reports && reports.length > 0) {
          const firstScanDate = new Date(reports[0].created_at);
          if (firstScanDate >= sevenDaysAgo && firstScanDate <= sixDaysAgo) {
            const summary = reports[0].summary as unknown as { mrrAtRisk: number };
            if (summary?.mrrAtRisk > 0) {
              await sendUpgradeNudgeEmail(user.email, summary.mrrAtRisk);
              nudgesSent++;
              console.log(`[EMAIL CRON] Upgrade nudge sent to ${user.email}`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[EMAIL CRON] Error sending upgrade nudges:", err);
  }

  const summary = `Email sequences: ${remindersSent} reminders, ${nudgesSent} upgrade nudges`;
  console.log(`[EMAIL CRON] ${summary}`);

  return NextResponse.json({
    message: summary,
    reminders: remindersSent,
    nudges: nudgesSent,
  });
}
