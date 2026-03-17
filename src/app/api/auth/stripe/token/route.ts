import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { cookies } from "next/headers";

/**
 * GET /api/auth/stripe/token
 *
 * Returns the decrypted OAuth access token from the cookie.
 * Used by the onboarding page to auto-start a scan after OAuth.
 * The token cookie is deleted after retrieval (one-time use).
 */
export async function GET() {
  try {
    // Verify user is logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const encryptedToken = cookieStore.get("stripe_oauth_token")?.value;
    const stripeAccountId = cookieStore.get("stripe_account_id")?.value;

    if (!encryptedToken) {
      return NextResponse.json(
        { error: "No OAuth token found. The connection may have expired." },
        { status: 404 }
      );
    }

    // Decrypt the token
    const accessToken = decrypt(encryptedToken);

    // Clear cookies after retrieval (one-time use)
    const response = NextResponse.json({
      accessToken,
      stripeAccountId: stripeAccountId || null,
    });

    response.cookies.set("stripe_oauth_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("stripe_account_id", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to retrieve token" },
      { status: 500 }
    );
  }
}
