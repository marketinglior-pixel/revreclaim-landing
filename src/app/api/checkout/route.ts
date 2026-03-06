import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/polar";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to upgrade your plan." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !["pro", "team"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'pro' or 'team'." },
        { status: 400 }
      );
    }

    // Check if user is already on this plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan === plan) {
      return NextResponse.json(
        { error: `You are already on the ${plan} plan.` },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `https://${req.headers.get("host")}`;

    // Create Polar checkout session
    const url = await createCheckout({
      userId: user.id,
      email: user.email!,
      plan: plan as "pro" | "team",
      baseUrl,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[CHECKOUT ERROR]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
