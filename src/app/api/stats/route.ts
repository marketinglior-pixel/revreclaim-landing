import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/logger";

const log = createLogger("STATS");

/**
 * Public stats endpoint — returns total scan count for social proof.
 * Uses service role to bypass RLS. Cached for 1 hour.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // Return a fallback count if Supabase is not configured
      return NextResponse.json(
        { totalScans: 0 },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { count, error } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true });

    if (error) {
      log.error("Error fetching count:", error.message);
      return NextResponse.json(
        { totalScans: 0 },
        {
          headers: {
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        }
      );
    }

    return NextResponse.json(
      { totalScans: count || 0 },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  } catch (err) {
    log.error("Unexpected error:", err);
    return NextResponse.json(
      { totalScans: 0 },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  }
}
