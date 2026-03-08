import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guardMutation } from "@/lib/api-security";
import { createLogger } from "@/lib/logger";

const log = createLogger("TEAM_MEMBERS");

/**
 * GET /api/team/members — List team members for the authenticated user.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: members, error } = await supabase
      .from("team_members")
      .select("id, member_email, role, invite_status, invited_at, accepted_at")
      .eq("team_owner_id", user.id)
      .order("invited_at", { ascending: false });

    if (error) {
      log.error("Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch team members." },
        { status: 500 }
      );
    }

    return NextResponse.json({ members: members || [] });
  } catch (error) {
    log.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/team/members — Remove a team member by ID.
 */
export async function DELETE(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required." },
        { status: 400 }
      );
    }

    // Only team owner can remove members
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId)
      .eq("team_owner_id", user.id);

    if (error) {
      log.error("Delete error:", error);
      return NextResponse.json(
        { error: "Failed to remove team member." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Team member removed." });
  } catch (error) {
    log.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to remove team member." },
      { status: 500 }
    );
  }
}
