import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_EMAIL = "revreclaim@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
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
                <td style="padding: 8px 12px; color: #111827;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #6b7280;">Email</td>
                <td style="padding: 8px 12px; color: #111827;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #6b7280;">Subject</td>
                <td style="padding: 8px 12px; color: #111827;">${subjectLabel}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; color: #6b7280; margin: 0 0 8px 0;">Message</p>
              <p style="color: #111827; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
              Sent from RevReclaim contact form at ${new Date().toISOString()}
            </p>
          </div>
        `,
      });
    } else {
      console.error("[CONTACT] RESEND_API_KEY not configured — email not sent");
    }

    // Also log to Google Sheets webhook (fire-and-forget)
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
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
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONTACT] Error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
