import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      console.error("[TEAM MEMBERS] Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch team members." },
        { status: 500 }
      );
    }

    return NextResponse.json({ members: members || [] });
  } catch (error) {
    console.error("[TEAM MEMBERS ERROR]", error);
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
      console.error("[TEAM MEMBERS] Delete error:", error);
      return NextResponse.json(
        { error: "Failed to remove team member." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Team member removed." });
  } catch (error) {
    console.error("[TEAM MEMBERS DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to remove team member." },
      { status: 500 }
    );
  }
}
