import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForToken } from "@/lib/stripe-oauth";
import { encrypt } from "@/lib/encryption";
import { createLogger } from "@/lib/logger";

const log = createLogger("STRIPE_OAUTH_CALLBACK");

/**
 * GET /api/auth/stripe/callback
 *
 * Stripe redirects here after user authorizes.
 * Exchanges the code for an access_token, stores it encrypted in a cookie,
 * and redirects to the onboarding page to auto-start the scan.
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://revreclaim.com";

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // User denied access or Stripe returned an error
    if (error) {
      log.warn(`OAuth denied: ${error} — ${errorDescription}`);
      const message = error === "access_denied"
        ? "You declined the connection. No worries — you can still use an API key."
        : errorDescription || error;
      return NextResponse.redirect(
        `${baseUrl}/onboarding?error=${encodeURIComponent(message)}`
      );
    }

    // Validate required params
    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/onboarding?error=${encodeURIComponent("Missing OAuth parameters. Please try again.")}`
      );
    }

    // CSRF check: verify state matches cookie
    const storedState = req.cookies.get("stripe_oauth_state")?.value;
    if (!storedState || storedState !== state) {
      log.warn("CSRF state mismatch on OAuth callback");
      return NextResponse.redirect(
        `${baseUrl}/onboarding?error=${encodeURIComponent("Security validation failed. Please try connecting again.")}`
      );
    }

    // Verify user is logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${baseUrl}/auth/signup?redirect=/onboarding`
      );
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    log.info(
      `OAuth connected for user ${user.id}: Stripe account ${tokenData.stripe_user_id} (livemode: ${tokenData.livemode})`
    );

    // Encrypt the access token and store in a short-lived cookie
    // The onboarding page reads this, triggers the scan, then the cookie is cleared
    const encryptedToken = encrypt(tokenData.access_token);

    const response = NextResponse.redirect(
      `${baseUrl}/onboarding?connected=stripe&stripe_account=${tokenData.stripe_user_id}&livemode=${tokenData.livemode}`
    );

    // Store encrypted token — short-lived, httpOnly
    response.cookies.set("stripe_oauth_token", encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes — just enough to trigger the scan
      path: "/",
    });

    // Store Stripe account ID for reference
    response.cookies.set("stripe_account_id", tokenData.stripe_user_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });

    // Clear the CSRF state cookie
    response.cookies.set("stripe_oauth_state", "", {
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    log.error("OAuth callback error:", message);
    return NextResponse.redirect(
      `${baseUrl}/onboarding?error=${encodeURIComponent(`Stripe connection failed: ${message}`)}`
    );
  }
}
