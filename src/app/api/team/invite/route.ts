import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canInviteTeamMember } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { sendTeamInviteEmail } from "@/lib/email";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Can't invite yourself
    if (normalizedEmail === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "You can't invite yourself." },
        { status: 400 }
      );
    }

    // Check plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, email")
      .eq("id", user.id)
      .single();

    const userPlan = ((profile?.plan as string) || "free") as PlanType;

    // Get current member count
    const { count } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_owner_id", user.id);

    const check = canInviteTeamMember(userPlan, count || 0);
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 });
    }

    // Check if already invited
    const { data: existing } = await supabase
      .from("team_members")
      .select("id, invite_status")
      .eq("team_owner_id", user.id)
      .eq("member_email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.invite_status === "accepted"
              ? "This person is already on your team."
              : "An invite has already been sent to this email.",
        },
        { status: 400 }
      );
    }

    // Check if the invitee already has an account
    const { data: inviteeProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    // Create invite
    const { error: insertError } = await supabase
      .from("team_members")
      .insert({
        team_owner_id: user.id,
        member_email: normalizedEmail,
        member_id: inviteeProfile?.id || null,
        role: "member",
        invite_status: inviteeProfile ? "accepted" : "pending",
        accepted_at: inviteeProfile ? new Date().toISOString() : null,
      });

    if (insertError) {
      console.error("[TEAM INVITE] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create invite." },
        { status: 500 }
      );
    }

    // Track event + send invite email (fire-and-forget)
    trackEvent("team_member_invited", user.id, { invitedEmail: normalizedEmail }).catch(() => {});
    sendTeamInviteEmail(normalizedEmail, profile?.email || user.email || "")
      .catch(() => {});

    return NextResponse.json({
      message: inviteeProfile
        ? "Team member added successfully."
        : "Invite sent! They'll join your team when they sign up.",
    });
  } catch (error) {
    console.error("[TEAM INVITE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to send invite." },
      { status: 500 }
    );
  }
}
