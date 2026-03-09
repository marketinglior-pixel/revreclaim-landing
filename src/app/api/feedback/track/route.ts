import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";
import { createLogger } from "@/lib/logger";

const log = createLogger("FEEDBACK");

const ALLOWED_EVENTS: AnalyticsEvent[] = [
  "post_scan_survey",
  "post_fix_survey",
  "nps_survey",
  "feedback_widget",
];

/**
 * POST /api/feedback/track
 * Client-safe endpoint for storing survey/feedback responses.
 * Uses service-role via trackEvent() server-side.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, event_data } = body;

    if (!event_name || !ALLOWED_EVENTS.includes(event_name)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    // Get user if authenticated (optional — FeedbackWidget allows anonymous)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Anonymous submission
    }

    await trackEvent(event_name, userId, event_data || {});

    log.info(`Tracked ${event_name}`, userId ? `user=${userId.slice(0, 8)}` : "anonymous");

    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error("Failed to track feedback:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
