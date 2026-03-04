import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") || "";
  const error = req.nextUrl.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (error) {
    console.log(`[STRIPE_OAUTH_ERROR] ${error} for ${state}`);
    return NextResponse.redirect(
      `${baseUrl}/connect?error=access_denied`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/connect?error=no_code`
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: process.env.STRIPE_SECRET_KEY || "",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.log(`[STRIPE_TOKEN_ERROR] ${tokenData.error_description}`);
      return NextResponse.redirect(
        `${baseUrl}/connect?error=token_failed`
      );
    }

    const {
      access_token,
      stripe_user_id,
      livemode,
      scope,
    } = tokenData;

    // Log connection (always - backup in Vercel logs)
    console.log(
      `[STRIPE_CONNECTED] account=${stripe_user_id} email=${state} livemode=${livemode} scope=${scope} at=${new Date().toISOString()}`
    );

    // Send to Google Sheets webhook if configured
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stripe_connected",
          email: state,
          stripe_user_id,
          access_token,
          livemode,
          scope,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    // Send email notification if configured
    const notifyUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    if (notifyUrl) {
      await fetch(notifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New Stripe connection! Account: ${stripe_user_id}, Email: ${state}, Livemode: ${livemode}`,
        }),
      });
    }

    return NextResponse.redirect(
      `${baseUrl}/connect/success?account=${stripe_user_id}`
    );
  } catch (err) {
    console.error("[STRIPE_CALLBACK_ERROR]", err);
    return NextResponse.redirect(
      `${baseUrl}/connect?error=server_error`
    );
  }
}
