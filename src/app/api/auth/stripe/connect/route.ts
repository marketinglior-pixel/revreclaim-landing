import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildStripeOAuthUrl } from "@/lib/stripe-oauth";
import { randomBytes } from "crypto";

/**
 * GET /api/auth/stripe/connect
 *
 * Redirects the user to Stripe's OAuth authorization page.
 * Generates a CSRF state token stored in a cookie for verification on callback.
 */
export async function GET() {
  try {
    // Verify user is logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Not logged in — redirect to signup with return URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://revreclaim.com";
      return NextResponse.redirect(
        `${baseUrl}/auth/signup?redirect=/api/auth/stripe/connect`
      );
    }

    // Generate CSRF state token
    const state = randomBytes(32).toString("hex");

    // Build the Stripe OAuth URL
    const oauthUrl = buildStripeOAuthUrl(state);

    // Set state cookie for CSRF verification on callback
    const response = NextResponse.redirect(oauthUrl);
    response.cookies.set("stripe_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes — enough to complete OAuth flow
      path: "/",
    });

    return response;
  } catch (error) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://revreclaim.com";
    const message = error instanceof Error ? error.message : "OAuth setup failed";
    return NextResponse.redirect(
      `${baseUrl}/onboarding?error=${encodeURIComponent(message)}`
    );
  }
}
