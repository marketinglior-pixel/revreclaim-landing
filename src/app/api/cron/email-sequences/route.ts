import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  sendReminderEmail,
  sendSocialProofEmail,
  sendUpgradeNudgeEmail,
  sendLastChanceEmail,
  sendNurtureEmail,
  shouldSendEmail,
} from "@/lib/email";
import { verifyCronSecret } from "@/lib/api-security";
import { createLogger } from "@/lib/logger";

const log = createLogger("EMAIL_CRON");

export const maxDuration = 60;

// Day offsets for the 4 nurture emails (sent after first scan)
const NURTURE_STEPS = [
  { step: 1 as const, minHours: 0, maxHours: 8 },       // Day 0: immediately after scan
  { step: 2 as const, minHours: 44, maxHours: 52 },      // Day 2
  { step: 3 as const, minHours: 116, maxHours: 124 },    // Day 5
  { step: 4 as const, minHours: 236, maxHours: 244 },    // Day 10
];

/**
 * Daily cron job for email sequences:
 * 1. Remind users who signed up 24h ago but never scanned
 * 2. Nudge free users to upgrade 7 days after their first scan
 *
 * Security: Protected by CRON_SECRET bearer token.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret (timing-safe comparison)
  if (!verifyCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  log.info("Daily email sequences started");

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
  let socialProofSent = 0;
  let nudgesSent = 0;
  let lastChanceSent = 0;

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
          if (await shouldSendEmail(user.id, "onboarding_drip")) {
            await sendReminderEmail(user.email);
            remindersSent++;
            log.info(`Reminder sent to ${user.email}`);
          }
        }
      }
    }
  } catch (err) {
    log.error("Error sending reminders:", err);
  }

  // 2. Social proof email to users who signed up ~3 days ago but never scanned
  try {
    const threeDaysAgoStart = new Date();
    threeDaysAgoStart.setHours(threeDaysAgoStart.getHours() - 76); // 76h ago
    const threeDaysAgoEnd = new Date();
    threeDaysAgoEnd.setHours(threeDaysAgoEnd.getHours() - 68); // 68h ago

    const { data: day3Users } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("plan", "free")
      .gte("created_at", threeDaysAgoStart.toISOString())
      .lte("created_at", threeDaysAgoEnd.toISOString());

    if (day3Users && day3Users.length > 0) {
      for (const user of day3Users) {
        // Only send if they still haven't scanned
        const { count } = await supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (!count || count === 0) {
          if (await shouldSendEmail(user.id, "onboarding_drip")) {
            await sendSocialProofEmail(user.email);
            socialProofSent++;
            log.info(`Social proof email sent to ${user.email}`);
          }
        }
      }
    }
  } catch (err) {
    log.error("Error sending social proof emails:", err);
  }

  // 3. Nudge free users to upgrade 7 days after first scan
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    // Find free users whose oldest report is ~7 days old
    const { data: freeUsers } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("plan", "free")
      .limit(500);

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
              if (await shouldSendEmail(user.id, "marketing_tips")) {
                await sendUpgradeNudgeEmail(user.email, summary.mrrAtRisk);
                nudgesSent++;
                log.info(`Upgrade nudge sent to ${user.email}`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    log.error("Error sending upgrade nudges:", err);
  }

  // 4. Last chance email to free users 14 days after first scan (still haven't upgraded)
  try {
    const fourteenDaysAgoStart = new Date();
    fourteenDaysAgoStart.setDate(fourteenDaysAgoStart.getDate() - 15);
    const fourteenDaysAgoEnd = new Date();
    fourteenDaysAgoEnd.setDate(fourteenDaysAgoEnd.getDate() - 13);

    const { data: lapsedUsers } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("plan", "free")
      .limit(500);

    if (lapsedUsers) {
      for (const user of lapsedUsers) {
        const { data: reports } = await supabase
          .from("reports")
          .select("created_at, summary")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1);

        if (reports && reports.length > 0) {
          const firstScanDate = new Date(reports[0].created_at);
          if (
            firstScanDate >= fourteenDaysAgoStart &&
            firstScanDate <= fourteenDaysAgoEnd
          ) {
            const summary = reports[0].summary as unknown as {
              mrrAtRisk: number;
              recoveryPotential?: number;
            };
            if (summary?.mrrAtRisk > 0) {
              if (await shouldSendEmail(user.id, "marketing_tips")) {
                await sendLastChanceEmail(user.email, summary.mrrAtRisk, summary.recoveryPotential);
                lastChanceSent++;
                log.info(`Last chance email sent to ${user.email}`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    log.error("Error sending last chance emails:", err);
  }

  // 5. Post-scan nurture emails (day 0, 2, 5, 10) for free users who scanned but didn't upgrade
  let nurtureSent = 0;
  try {
    for (const { step, minHours, maxHours } of NURTURE_STEPS) {
      const windowStart = new Date();
      windowStart.setHours(windowStart.getHours() - maxHours);
      const windowEnd = new Date();
      windowEnd.setHours(windowEnd.getHours() - minHours);

      // Find free users whose first report falls in this window
      const { data: freeUsers } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("plan", "free")
        .limit(500);

      if (freeUsers) {
        for (const user of freeUsers) {
          const { data: reports } = await supabase
            .from("reports")
            .select("id, created_at, summary, leaks")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })
            .limit(1);

          if (!reports || reports.length === 0) continue;

          const firstScanDate = new Date(reports[0].created_at);
          if (firstScanDate < windowStart || firstScanDate > windowEnd) continue;

          const reportSummary = reports[0].summary as unknown as {
            mrrAtRisk: number;
            leaksFound: number;
          };
          if (!reportSummary?.mrrAtRisk || reportSummary.mrrAtRisk <= 0) continue;

          // Check email preferences
          if (!(await shouldSendEmail(user.id, "onboarding_drip"))) continue;

          const leaks = (reports[0].leaks || []) as unknown as {
            type: string;
            monthlyImpact: number;
            description?: string;
          }[];
          const topLeaks = leaks
            .sort((a, b) => b.monthlyImpact - a.monthlyImpact)
            .slice(0, 3)
            .map((l) => ({ type: l.type, impact: l.monthlyImpact }));
          const biggest = leaks[0];

          await sendNurtureEmail(step, {
            email: user.email,
            reportId: reports[0].id,
            mrrAtRisk: reportSummary.mrrAtRisk,
            leakCount: reportSummary.leaksFound,
            topLeaks,
            biggestLeak: biggest
              ? {
                  type: biggest.type,
                  impact: biggest.monthlyImpact,
                  description: biggest.description || "",
                }
              : undefined,
          });
          nurtureSent++;
          log.info(`Nurture step ${step} sent to ${user.email}`);
        }
      }
    }
  } catch (err) {
    log.error("Error sending nurture emails:", err);
  }

  const summary = `Email sequences: ${remindersSent} reminders, ${socialProofSent} social proof, ${nudgesSent} upgrade nudges, ${lastChanceSent} last chance, ${nurtureSent} nurture`;
  log.info(summary);

  return NextResponse.json({
    message: summary,
    reminders: remindersSent,
    socialProof: socialProofSent,
    nudges: nudgesSent,
    lastChance: lastChanceSent,
    nurture: nurtureSent,
  });
}
