import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const log = createLogger("TEAM_ACCEPT");

/**
 * GET /api/team/accept — Accept a team invite (called when a user logs in).
 * Automatically links any pending invites to the authenticated user.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all pending invites for this email
    const { data: pendingInvites, error: fetchError } = await supabase
      .from("team_members")
      .select("id, team_owner_id")
      .eq("member_email", user.email.toLowerCase())
      .eq("invite_status", "pending");

    if (fetchError) {
      log.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to check invites." },
        { status: 500 }
      );
    }

    if (!pendingInvites || pendingInvites.length === 0) {
      return NextResponse.json({ message: "No pending invites found." });
    }

    // Accept all pending invites
    const { error: updateError } = await supabase
      .from("team_members")
      .update({
        member_id: user.id,
        invite_status: "accepted" as const,
        accepted_at: new Date().toISOString(),
      })
      .eq("member_email", user.email.toLowerCase())
      .eq("invite_status", "pending");

    if (updateError) {
      log.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to accept invites." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Accepted ${pendingInvites.length} team invite${pendingInvites.length > 1 ? "s" : ""}.`,
      accepted: pendingInvites.length,
    });
  } catch (error) {
    log.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to accept invites." },
      { status: 500 }
    );
  }
}
