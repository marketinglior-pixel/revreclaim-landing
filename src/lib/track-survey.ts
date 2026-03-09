/**
 * Client-safe survey/feedback tracking helper.
 * Posts to /api/feedback/track which stores server-side via service-role.
 * Fire-and-forget — never throws.
 */
export async function trackSurvey(
  eventName: string,
  eventData: Record<string, unknown>
): Promise<void> {
  try {
    await fetch("/api/feedback/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: eventName, event_data: eventData }),
    });
  } catch {
    // Fire-and-forget
  }
}
