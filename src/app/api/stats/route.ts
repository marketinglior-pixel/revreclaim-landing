import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/logger";

const log = createLogger("STATS");

/**
 * Public stats endpoint — returns total scan count for social proof.
 * Uses service role to bypass RLS. Cached for 1 hour.
 */
export async function GET() {
  const fallback = { totalScans: 0, totalRecoveredCents: 0 };
  const cacheHeaders = (maxAge: number) => ({
    "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
  });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(fallback, { headers: cacheHeaders(3600) });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch scan count and mrrAtRisk from reports in parallel
    const [countResult, reportsResult] = await Promise.all([
      supabase.from("reports").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("summary"),
    ]);

    if (countResult.error) {
      log.error("Error fetching count:", countResult.error.message);
      return NextResponse.json(fallback, { headers: cacheHeaders(300) });
    }

    // Sum mrrAtRisk from all report summaries (in cents)
    let totalRecoveredCents = 0;
    if (reportsResult.data) {
      for (const row of reportsResult.data) {
        const summary = row.summary as { mrrAtRisk?: number } | null;
        if (summary?.mrrAtRisk && summary.mrrAtRisk > 0) {
          totalRecoveredCents += summary.mrrAtRisk;
        }
      }
    }

    return NextResponse.json(
      { totalScans: countResult.count || 0, totalRecoveredCents },
      { headers: cacheHeaders(3600) }
    );
  } catch (err) {
    log.error("Unexpected error:", err);
    return NextResponse.json(fallback, { headers: cacheHeaders(300) });
  }
}
