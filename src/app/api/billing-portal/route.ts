import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guardMutation } from "@/lib/api-security";
import { createLogger } from "@/lib/logger";

const log = createLogger("BILLING_PORTAL");

export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get payment info from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "payment_customer_id, payment_subscription_id, plan"
      )
      .eq("id", user.id)
      .single();

    if (!profile?.payment_customer_id || profile.plan === "free") {
      return NextResponse.json(
        {
          error:
            "No billing account found. Please upgrade to a paid plan first.",
        },
        { status: 400 }
      );
    }

    // Polar customer portal URL
    const orgSlug = process.env.POLAR_ORGANIZATION_SLUG;

    if (orgSlug) {
      return NextResponse.json({
        url: `https://polar.sh/${orgSlug}/portal`,
      });
    }

    // Fallback: generic Polar purchases page
    return NextResponse.json({
      url: "https://polar.sh/purchases/subscriptions",
    });
  } catch (error) {
    log.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to access billing portal" },
      { status: 500 }
    );
  }
}
