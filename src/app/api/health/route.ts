import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Health check endpoint for uptime monitoring (Betterstack, UptimeRobot, etc.)
 *
 * GET /api/health
 *
 * Returns:
 *   200 — { status: "ok", db: "ok", timestamp }
 *   503 — { status: "degraded", db: "error", error, timestamp }
 *
 * Not protected by auth or CSRF — intentionally public.
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  // Check Supabase connectivity
  try {
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

    // Simple query to verify DB is alive
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          db: "error",
          error: error.message,
          timestamp,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      db: "ok",
      timestamp,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        db: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp,
      },
      { status: 503 }
    );
  }
}
