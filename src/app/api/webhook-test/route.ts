import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWebhookNotification } from "@/lib/notifications/webhook";
import { guardMutation } from "@/lib/api-security";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";

const log = createLogger("WEBHOOK_TEST");

/**
 * POST /api/webhook-test — Send a test event to the user's configured webhook.
 */
export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    // Rate limit: 5 tests per IP per hour
    const ip = getClientIP(req);
    const rl = await rateLimit(
      { name: "webhook-test", maxRequests: 5, windowSeconds: 3600 },
      ip
    );
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch webhook config
    const { data: config } = await supabase
      .from("scan_configs")
      .select("webhook_url, webhook_secret")
      .eq("user_id", user.id)
      .single();

    if (!config?.webhook_url || !config?.webhook_secret) {
      return NextResponse.json(
        { error: "No webhook URL configured. Add one in Settings first." },
        { status: 400 }
      );
    }

    // Send test event
    await sendWebhookNotification(
      config.webhook_url,
      config.webhook_secret,
      "test",
      {
        message: "This is a test event from RevReclaim.",
        userId: user.id,
        testSentAt: new Date().toISOString(),
      }
    );

    log.info(`Test webhook sent for user ${user.id}`);

    return NextResponse.json({
      message: "Test event sent to your webhook endpoint.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error(`Error: ${message}`);
    return NextResponse.json(
      { error: "Failed to send test event." },
      { status: 500 }
    );
  }
}
