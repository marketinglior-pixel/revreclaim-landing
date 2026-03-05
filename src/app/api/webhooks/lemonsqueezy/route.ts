import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  getServiceClient,
  getPlanFromVariantId,
  type LemonSqueezyWebhookPayload,
} from "@/lib/lemonsqueezy";
import {
  sendUpgradeConfirmationEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing x-signature header" },
      { status: 400 }
    );
  }

  let payload: LemonSqueezyWebhookPayload;

  try {
    const rawBody = await req.text();

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("[LS WEBHOOK] Signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[LS WEBHOOK] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const eventName = payload.meta.event_name;
  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data.attributes;
  const supabase = getServiceClient();

  try {
    switch (eventName) {
      // ---------------------------------------------------------------
      // New subscription created (checkout completed)
      // ---------------------------------------------------------------
      case "subscription_created": {
        if (!userId) {
          console.error(
            "[LS WEBHOOK] Missing user_id in subscription_created"
          );
          break;
        }

        const variantId = String(attrs.variant_id);
        const plan = getPlanFromVariantId(variantId);

        if (!plan) {
          console.error(
            `[LS WEBHOOK] Unknown variant_id: ${variantId}`
          );
          break;
        }

        console.log(
          `[LS WEBHOOK] Subscription created: user=${userId}, plan=${plan}`
        );

        await supabase
          .from("profiles")
          .update({
            plan,
            payment_customer_id: String(attrs.customer_id),
            payment_subscription_id: String(payload.data.id),
            payment_portal_url: attrs.urls?.customer_portal || null,
            scan_count_this_period: 0,
          })
          .eq("id", userId);

        // Track upgrade event
        trackEvent("plan_upgraded", userId, { plan }).catch(() => {});

        // Send confirmation email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .single();

        if (profile?.email) {
          sendUpgradeConfirmationEmail(profile.email, plan).catch(() => {});
        }

        break;
      }

      // ---------------------------------------------------------------
      // Subscription updated (plan change, renewal, status change)
      // ---------------------------------------------------------------
      case "subscription_updated": {
        const subscriptionId = String(payload.data.id);
        const status = attrs.status;

        // Find user by subscription ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, plan")
          .eq("payment_subscription_id", subscriptionId)
          .single();

        if (!profile) {
          // Try finding by custom_data user_id
          if (userId) {
            const variantId = String(attrs.variant_id);
            const plan = getPlanFromVariantId(variantId);

            if (plan) {
              await supabase
                .from("profiles")
                .update({
                  plan,
                  payment_subscription_id: subscriptionId,
                  payment_portal_url: attrs.urls?.customer_portal || null,
                })
                .eq("id", userId);

              console.log(
                `[LS WEBHOOK] Subscription updated via custom_data: user=${userId}, plan=${plan}`
              );
            }
          } else {
            console.error(
              `[LS WEBHOOK] No profile found for subscription: ${subscriptionId}`
            );
          }
          break;
        }

        // Update portal URL (refreshes every 24h)
        const updates: Record<string, unknown> = {
          payment_portal_url: attrs.urls?.customer_portal || null,
        };

        // Check if plan changed
        const variantId = String(attrs.variant_id);
        const newPlan = getPlanFromVariantId(variantId);

        if (newPlan && newPlan !== profile.plan) {
          updates.plan = newPlan;
          console.log(
            `[LS WEBHOOK] Plan changed: user=${profile.id}, ${profile.plan} -> ${newPlan}`
          );
        }

        // If subscription is active after a renewal, reset scan count
        if (status === "active" && attrs.renews_at) {
          updates.scan_count_this_period = 0;
          updates.plan_period_start = attrs.updated_at;
          updates.plan_period_end = attrs.renews_at;
        }

        // If subscription expired or cancelled
        if (status === "expired" || status === "cancelled") {
          updates.plan = "free";
          updates.payment_subscription_id = null;
          updates.scan_count_this_period = 0;
          console.log(
            `[LS WEBHOOK] Subscription ${status}: user=${profile.id}, reverted to free`
          );
          trackEvent("plan_cancelled", profile.id, {
            reason: status,
          }).catch(() => {});
        }

        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", profile.id);

        break;
      }

      // ---------------------------------------------------------------
      // Subscription payment success (renewal)
      // ---------------------------------------------------------------
      case "subscription_payment_success": {
        // Find user by customer_id from attributes
        const customerId = String(attrs.customer_id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("payment_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              scan_count_this_period: 0,
              plan_period_start: new Date().toISOString(),
            })
            .eq("id", profile.id);

          console.log(
            `[LS WEBHOOK] Payment succeeded: user=${profile.id}, period reset`
          );
        }

        break;
      }

      // ---------------------------------------------------------------
      // Subscription payment failed
      // ---------------------------------------------------------------
      case "subscription_payment_failed": {
        const customerId = String(attrs.customer_id);
        console.warn(
          `[LS WEBHOOK] Payment failed for customer: ${customerId}`
        );

        const { data: failedProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("payment_customer_id", customerId)
          .single();

        if (failedProfile?.email) {
          sendPaymentFailedEmail(failedProfile.email).catch(() => {});
        }

        break;
      }

      default:
        console.log(`[LS WEBHOOK] Unhandled event: ${eventName}`);
    }
  } catch (error) {
    console.error(`[LS WEBHOOK] Error handling ${eventName}:`, error);
    // Still return 200 to prevent LS from retrying
  }

  return NextResponse.json({ received: true });
}
