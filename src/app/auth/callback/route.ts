import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { safeRedirect } from "@/lib/safe-redirect";
import { fireAndForget } from "@/lib/fire-and-forget";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = safeRedirect(searchParams.get("redirect"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if this is a new user (no reports = new user)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Auto-accept any pending team invites (fire-and-forget)
        if (user.email) {
          void supabase
            .from("team_members")
            .update({
              member_id: user.id,
              invite_status: "accepted" as const,
              accepted_at: new Date().toISOString(),
            })
            .eq("member_email", user.email.toLowerCase())
            .eq("invite_status", "pending")
            .then(() => {});
        }

        const { count } = await supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        const isNewUser = !count || count === 0;

        if (isNewUser) {
          // Send welcome email (fire-and-forget)
          if (user.email) {
            fireAndForget(sendWelcomeEmail(user.email), "WELCOME_EMAIL");
          }

          // Redirect new users to onboarding wizard instead of empty dashboard
          if (redirect === "/dashboard") {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Auth failed, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
