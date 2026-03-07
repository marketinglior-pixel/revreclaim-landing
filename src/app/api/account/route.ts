import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { guardMutation } from "@/lib/api-security";

/**
 * DELETE /api/account
 * Deletes user's data and auth account.
 * Requires authentication.
 */
export async function DELETE(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    // Rate limit: 3 per IP per hour
    const ip = getClientIP(req);
    const rl = await rateLimit({ name: "account-delete", maxRequests: 3, windowSeconds: 3600 }, ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    // Get authenticated user
    let supabaseResponse = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              req.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use service role client for admin operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const userId = user.id;

    // Delete user's data in order (respecting foreign keys)
    // 1. Delete team memberships (owner or member)
    await adminClient.from("team_members").delete().eq("team_owner_id", userId);
    await adminClient.from("team_members").delete().eq("member_id", userId);

    // 2. Delete analytics events
    await adminClient.from("analytics_events").delete().eq("user_id", userId);

    // 3. Delete scan configs
    await adminClient.from("scan_configs").delete().eq("user_id", userId);

    // 4. Delete reports
    await adminClient.from("reports").delete().eq("user_id", userId);

    // 5. Delete profile
    await adminClient.from("profiles").delete().eq("id", userId);

    // 4. Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("[ACCOUNT] Error deleting auth user:", deleteError.message);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    console.log(`[ACCOUNT] Deleted user ${userId}`);

    return NextResponse.json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("[ACCOUNT] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
