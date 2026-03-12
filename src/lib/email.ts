import { Resend } from "resend";
import {
  welcomeEmailHtml,
  scanCompleteEmailHtml,
  upgradeConfirmationEmailHtml,
  scanLimitReachedEmailHtml,
  paymentFailedEmailHtml,
  reminderEmailHtml,
  upgradeNudgeEmailHtml,
  socialProofEmailHtml,
  lastChanceEmailHtml,
  teamInviteEmailHtml,
  dunningFailedPaymentHtml,
  dunningExpiringCardHtml,
  dunningPaymentUpdateHtml,
  type DunningEmailData,
} from "./email-templates";
import type { DunningTemplate } from "./recovery/types";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { createLogger } from "./logger";

const log = createLogger("EMAIL");

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "RevReclaim <noreply@revreclaim.com>";

type NotificationCategory =
  | "scan_complete"
  | "weekly_summary"
  | "onboarding_drip"
  | "marketing_tips";

/**
 * Check if a user has opted out of a specific notification category.
 * Returns true if the email should be sent (default behavior: all enabled).
 */
export async function shouldSendEmail(
  userId: string,
  category: NotificationCategory
): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return true;

    const supabase = createClient<Database>(url, key);
    const { data: profile } = await supabase
      .from("profiles")
      .select("notification_preferences")
      .eq("id", userId)
      .single();

    if (!profile?.notification_preferences) return true;

    const prefs = profile.notification_preferences as unknown as Record<string, boolean>;
    return prefs[category] !== false;
  } catch {
    // Default to sending if preference check fails
    return true;
  }
}

/**
 * Send welcome email to new users.
 */
export async function sendWelcomeEmail(to: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "Welcome to RevReclaim — Find Your Hidden Revenue",
      html: welcomeEmailHtml(),
    });
  } catch (err) {
    log.error("Failed to send welcome email:", err);
  }
}

/**
 * Send scan completion email with report summary.
 */
export async function sendScanCompleteEmail(
  to: string,
  summary: {
    leaksFound: number;
    mrrAtRisk: number;
    recoveryPotential: number;
    healthScore: number;
  },
  reportId: string
): Promise<void> {
  try {
    const mrrFormatted = `$${(summary.mrrAtRisk / 100).toLocaleString()}`;
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Scan Complete: ${summary.leaksFound} leaks found (${mrrFormatted}/mo at risk)`,
      html: scanCompleteEmailHtml({ ...summary, reportId }),
    });
  } catch (err) {
    log.error("Failed to send scan complete email:", err);
  }
}

/**
 * Send upgrade confirmation email.
 */
export async function sendUpgradeConfirmationEmail(
  to: string,
  plan: string
): Promise<void> {
  try {
    const planName = plan === "watch" ? "Leak Watch" : plan === "pro" ? "Pro" : "Team";
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Welcome to RevReclaim ${planName}! 🎉`,
      html: upgradeConfirmationEmailHtml(plan),
    });
  } catch (err) {
    log.error("Failed to send upgrade confirmation email:", err);
  }
}

/**
 * Send scan limit reached email (nudge to upgrade).
 */
export async function sendScanLimitReachedEmail(to: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "You've reached your free scan limit",
      html: scanLimitReachedEmailHtml(),
    });
  } catch (err) {
    log.error("Failed to send scan limit email:", err);
  }
}

/**
 * Send payment failed notification.
 */
export async function sendPaymentFailedEmail(to: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "Action needed: Payment failed for RevReclaim",
      html: paymentFailedEmailHtml(),
    });
  } catch (err) {
    log.error("Failed to send payment failed email:", err);
  }
}

/**
 * Send reminder to users who haven't scanned yet.
 */
export async function sendReminderEmail(to: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "Your free revenue leak scan is waiting",
      html: reminderEmailHtml(),
    });
  } catch (err) {
    log.error("Failed to send reminder email:", err);
  }
}

/**
 * Send upgrade nudge to free users who found leaks.
 */
export async function sendUpgradeNudgeEmail(
  to: string,
  mrrAtRisk: number
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "Your revenue leaks are still open",
      html: upgradeNudgeEmailHtml(mrrAtRisk),
    });
  } catch (err) {
    log.error("Failed to send upgrade nudge email:", err);
  }
}

/**
 * Send social proof email (Day 3 drip) to users who haven't scanned yet.
 */
export async function sendSocialProofEmail(to: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "Here's what other SaaS founders found",
      html: socialProofEmailHtml(),
    });
  } catch (err) {
    log.error("Failed to send social proof email:", err);
  }
}

/**
 * Send last chance email (Day 14 drip) to free users with open leaks.
 */
export async function sendLastChanceEmail(
  to: string,
  mrrAtRisk: number
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: "Your revenue leaks are growing",
      html: lastChanceEmailHtml(mrrAtRisk),
    });
  } catch (err) {
    log.error("Failed to send last chance email:", err);
  }
}

/**
 * Send team invite email.
 */
export async function sendTeamInviteEmail(
  to: string,
  inviterEmail: string
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `${inviterEmail} invited you to RevReclaim`,
      html: teamInviteEmailHtml(inviterEmail),
    });
  } catch (err) {
    log.error("Failed to send team invite email:", err);
  }
}

// ============================================================
// Dunning Emails — sent to SaaS end-customers on behalf of user
// ============================================================

const DUNNING_SUBJECTS: Record<DunningTemplate, string> = {
  failed_payment: "Action Required: Your payment didn't go through",
  expiring_card: "Heads up: Your card expires soon",
  payment_update: "Action Required: Please update your payment method",
};

const DUNNING_TEMPLATE_RENDERERS: Record<
  DunningTemplate,
  (data: DunningEmailData) => string
> = {
  failed_payment: dunningFailedPaymentHtml,
  expiring_card: dunningExpiringCardHtml,
  payment_update: dunningPaymentUpdateHtml,
};

/**
 * Send a dunning email to a SaaS customer (not to the RevReclaim user).
 */
export async function sendDunningEmail(
  to: string,
  template: DunningTemplate,
  data: DunningEmailData
): Promise<void> {
  const subject = DUNNING_SUBJECTS[template];
  const renderer = DUNNING_TEMPLATE_RENDERERS[template];

  if (!renderer) {
    throw new Error(`Unknown dunning template: ${template}`);
  }

  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: renderer(data),
  });

  log.info(`Sent ${template} email to ${to.split("@")[0]}***`);
}
