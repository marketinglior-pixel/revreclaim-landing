import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 subscriptions per IP per hour
    const ip = getClientIP(req);
    const rl = rateLimit({ name: "subscribe", maxRequests: 3, windowSeconds: 3600 }, ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const { email, plan } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Add to Resend audience if configured
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId && process.env.RESEND_API_KEY) {
      try {
        await resend.contacts.create({
          audienceId,
          email,
          unsubscribed: false,
        });
      } catch (err) {
        // Log but don't fail — Google Sheet fallback still works
        console.error("[SUBSCRIBE] Resend audience error:", err);
      }
    }

    // Google Sheet webhook fallback
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "revreclaim-landing",
          plan: plan || "general",
          timestamp: new Date().toISOString(),
        }),
      });
    }

    // Log signup event (no PII in logs)
    console.log(`[SIGNUP] New subscriber (plan: ${plan || "general"}) at ${new Date().toISOString()}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
