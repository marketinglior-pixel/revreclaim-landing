import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest) {
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
      .select("payment_portal_url, payment_customer_id, payment_subscription_id, plan")
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

    // Lemon Squeezy provides a customer portal URL in the webhook payload.
    // It's valid for 24 hours and stored in the profile.
    if (profile.payment_portal_url) {
      return NextResponse.json({ url: profile.payment_portal_url });
    }

    // Fallback: fetch fresh portal URL from LS API
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (apiKey && profile.payment_subscription_id) {
      try {
        const res = await fetch(
          `https://api.lemonsqueezy.com/v1/subscriptions/${profile.payment_subscription_id}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/vnd.api+json",
            },
          }
        );

        if (res.ok) {
          const lsData = await res.json();
          const portalUrl =
            lsData?.data?.attributes?.urls?.customer_portal;

          if (portalUrl) {
            // Cache the fresh URL for future use
            void supabase
              .from("profiles")
              .update({ payment_portal_url: portalUrl })
              .eq("id", user.id);

            return NextResponse.json({ url: portalUrl });
          }
        }
      } catch (err) {
        console.error("[BILLING PORTAL] LS API fallback failed:", err);
      }
    }

    // Last fallback: store billing page
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (storeId) {
      return NextResponse.json({
        url: `https://${storeId}.lemonsqueezy.com/billing`,
      });
    }

    return NextResponse.json(
      {
        error:
          "Billing portal is temporarily unavailable. Please try again later or contact support.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("[BILLING PORTAL ERROR]", error);
    return NextResponse.json(
      { error: "Failed to access billing portal" },
      { status: 500 }
    );
  }
}
