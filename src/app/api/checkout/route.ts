import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/polar";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { guardMutation } from "@/lib/api-security";
import { createLogger } from "@/lib/logger";
import { logAudit } from "@/lib/audit-log";
import { fireAndForget } from "@/lib/fire-and-forget";

const log = createLogger("CHECKOUT");

export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    // Rate limit: 5 checkout attempts per IP per hour
    const ip = getClientIP(req);
    const rl = await rateLimit({ name: "checkout", maxRequests: 5, windowSeconds: 3600 }, ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

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
    const { plan, discountId, billing } = body;

    if (!plan || !["watch", "pro", "team"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'watch', 'pro', or 'team'." },
        { status: 400 }
      );
    }

    const billingInterval =
      billing === "annual" ? "annual" : "monthly";

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
    }

    // Create Polar checkout session
    const url = await createCheckout({
      userId: user.id,
      email: user.email!,
      plan: plan as "watch" | "pro" | "team",
      baseUrl,
      billing: billingInterval as "monthly" | "annual",
      ...(discountId && typeof discountId === "string" ? { discountId } : {}),
    });

    fireAndForget(
      logAudit({
        userId: user.id,
        action: "plan_upgraded",
        resource: "subscription",
        metadata: { plan, fromPlan: profile?.plan || "free" },
      }),
      "CHECKOUT_AUDIT"
    );

    return NextResponse.json({ url });
  } catch (error) {
    log.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
