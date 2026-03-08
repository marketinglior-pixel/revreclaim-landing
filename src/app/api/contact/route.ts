import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { guardMutation } from "@/lib/api-security";
import { fireAndForget } from "@/lib/fire-and-forget";
import { createLogger } from "@/lib/logger";

const log = createLogger("CONTACT");

const CONTACT_EMAIL = "revreclaim@gmail.com";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ---------------------------------------------------------------------------
// HTML sanitization
// ---------------------------------------------------------------------------
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const { name, email, subject, message } = await req.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Length validation to prevent abuse
    if (typeof name !== "string" || name.length > 200) {
      return NextResponse.json({ error: "Name is too long (max 200 chars)." }, { status: 400 });
    }
    if (typeof email !== "string" || email.length > 320) {
      return NextResponse.json({ error: "Email is too long." }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json({ error: "Message is too long (max 5,000 chars)." }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const subjectLabels: Record<string, string> = {
      general: "General Question",
      bug: "Bug Report",
      billing: "Billing & Pricing",
      security: "Security Concern",
      feature: "Feature Request",
      delete: "Account Deletion",
    };

    const subjectLabel = subjectLabels[subject] || subject || "General";
    const emailSubject = `[RevReclaim Contact] ${subjectLabel} from ${name}`;

    // Sanitize user inputs for HTML email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "RevReclaim <noreply@revreclaim.com>",
        to: CONTACT_EMAIL,
        replyTo: email,
        subject: emailSubject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981; margin-bottom: 24px;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #6b7280; width: 100px;">Name</td>
                <td style="padding: 8px 12px; color: #111827;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #6b7280;">Email</td>
                <td style="padding: 8px 12px; color: #111827;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #6b7280;">Subject</td>
                <td style="padding: 8px 12px; color: #111827;">${subjectLabel}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; color: #6b7280; margin: 0 0 8px 0;">Message</p>
              <p style="color: #111827; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
              Sent from RevReclaim contact form at ${new Date().toISOString()}
            </p>
          </div>
        `,
      });
    } else {
      log.error("RESEND_API_KEY not configured — email not sent");
    }

    // Also log to Google Sheets webhook (fire-and-forget)
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      fireAndForget(fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_form",
          name,
          email,
          subject: subjectLabel,
          message,
          timestamp: new Date().toISOString(),
        }),
      }), "CONTACT_FORM_WEBHOOK");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
