import { Resend } from "resend";
import {
  welcomeEmailHtml,
  scanCompleteEmailHtml,
  upgradeConfirmationEmailHtml,
  scanLimitReachedEmailHtml,
  paymentFailedEmailHtml,
  reminderEmailHtml,
  upgradeNudgeEmailHtml,
  teamInviteEmailHtml,
} from "./email-templates";

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
    console.error("[EMAIL] Failed to send welcome email:", err);
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
    console.error("[EMAIL] Failed to send scan complete email:", err);
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
    const planName = plan === "pro" ? "Pro" : "Team";
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Welcome to RevReclaim ${planName}! 🎉`,
      html: upgradeConfirmationEmailHtml(plan),
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send upgrade confirmation email:", err);
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
    console.error("[EMAIL] Failed to send scan limit email:", err);
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
    console.error("[EMAIL] Failed to send payment failed email:", err);
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
    console.error("[EMAIL] Failed to send reminder email:", err);
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
    console.error("[EMAIL] Failed to send upgrade nudge email:", err);
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
    console.error("[EMAIL] Failed to send team invite email:", err);
  }
}
