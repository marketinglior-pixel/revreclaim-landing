import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.STRIPE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const email = req.nextUrl.searchParams.get("email") || "";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_only",
    redirect_uri: `${baseUrl}/api/stripe/callback`,
    state: email,
    stripe_landing: "login",
  });

  const stripeUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(stripeUrl);
}
