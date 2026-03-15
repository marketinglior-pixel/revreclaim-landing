import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/claim-report
 *
 * Allows a newly signed-up user to claim a guest scan report.
 * The report data comes from sessionStorage on the client side.
 * This saves it to the DB under the authenticated user's ID.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, platform, summary, categories, leaks } = body;

    if (!reportId || !summary || !categories || !leaks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if report already exists (avoid duplicates)
    const { data: existing } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .single();

    if (existing) {
      return NextResponse.json({ ok: true, message: "Report already saved" });
    }

    // Insert the report under this user's ID
    const { error: dbError } = await supabase.from("reports").insert({
      id: reportId,
      user_id: user.id,
      platform: platform || "stripe",
      summary: JSON.parse(JSON.stringify(summary)),
      categories: JSON.parse(JSON.stringify(categories)),
      leaks: JSON.parse(JSON.stringify(leaks)),
      is_test_mode: false,
    });

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to save report" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Report claimed" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
