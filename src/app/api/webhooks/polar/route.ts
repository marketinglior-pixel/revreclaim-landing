import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  getServiceClient,
  getPlanFromProductId,
  type PolarWebhookPayload,
} from "@/lib/polar";
import {
  sendUpgradeConfirmationEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const webhookId = req.headers.get("webhook-id");
  const webhookTimestamp = req.headers.get("webhook-timestamp");
  const webhookSignature = req.headers.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return NextResponse.json(
      { error: "Missing webhook headers" },
      { status: 400 }
    );
  }

  let payload: PolarWebhookPayload;

  try {
    const rawBody = await req.text();

    if (
      !verifyWebhookSignature(
        rawBody,
        webhookId,
        webhookTimestamp,
        webhookSignature
      )
    ) {
      console.error("[POLAR WEBHOOK] Signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    payload = JSON.parse(rawBody) as PolarWebhookPayload;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[POLAR WEBHOOK] Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const eventType = payload.type;
  const subscriptionData = payload.data;
  const userId = subscriptionData.metadata?.user_id;
  const supabase = getServiceClient();

  try {
    switch (eventType) {
      // ---------------------------------------------------------------
      // New subscription created (checkout completed)
      // ---------------------------------------------------------------
      case "subscription.created": {
        if (!userId) {
          console.error(
            "[POLAR WEBHOOK] Missing user_id in subscription.created"
          );
          break;
        }

        const productId = subscriptionData.product_id;
        if (!productId) {
          console.error("[POLAR WEBHOOK] Missing product_id");
          break;
        }

        const plan = getPlanFromProductId(productId);
        if (!plan) {
          console.error(
            `[POLAR WEBHOOK] Unknown product_id: ${productId}`
          );
          break;
        }

        console.log(
          `[POLAR WEBHOOK] Subscription created: user=${userId}, plan=${plan}`
        );

        await supabase
          .from("profiles")
          .update({
            plan,
            payment_customer_id:
              subscriptionData.customer_id ||
              subscriptionData.customer?.id ||
              null,
            payment_subscription_id: subscriptionData.id,
            payment_portal_url: null,
            scan_count_this_period: 0,
            plan_period_start:
              subscriptionData.current_period_start ||
              new Date().toISOString(),
            plan_period_end:
              subscriptionData.current_period_end || null,
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
          sendUpgradeConfirmationEmail(profile.email, plan).catch(
            () => {}
          );
        }

        break;
      }

      // ---------------------------------------------------------------
      // Subscription updated (plan change, renewal, status change)
      // ---------------------------------------------------------------
      case "subscription.updated": {
        const subscriptionId = subscriptionData.id;
        const status = subscriptionData.status;

        // Find user by subscription ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, plan")
          .eq("payment_subscription_id", subscriptionId)
          .single();

        if (!profile) {
          // Try finding by metadata user_id
          if (userId) {
            const productId = subscriptionData.product_id;
            if (productId) {
              const plan = getPlanFromProductId(productId);
              if (plan) {
                await supabase
                  .from("profiles")
                  .update({
                    plan,
                    payment_subscription_id: subscriptionId,
                  })
                  .eq("id", userId);

                console.log(
                  `[POLAR WEBHOOK] Subscription updated via metadata: user=${userId}, plan=${plan}`
                );
              }
            }
          } else {
            console.error(
              `[POLAR WEBHOOK] No profile found for subscription: ${subscriptionId}`
            );
          }
          break;
        }

        const updates: Record<string, unknown> = {};

        // Check if plan changed
        if (subscriptionData.product_id) {
          const newPlan = getPlanFromProductId(
            subscriptionData.product_id
          );
          if (newPlan && newPlan !== profile.plan) {
            updates.plan = newPlan;
            console.log(
              `[POLAR WEBHOOK] Plan changed: user=${profile.id}, ${profile.plan} -> ${newPlan}`
            );
          }
        }

        // If subscription is active, update period
        if (status === "active") {
          if (subscriptionData.current_period_start) {
            updates.scan_count_this_period = 0;
            updates.plan_period_start =
              subscriptionData.current_period_start;
            updates.plan_period_end =
              subscriptionData.current_period_end || null;
          }
        }

        // If subscription cancelled or revoked
        if (status === "canceled" || status === "revoked") {
          updates.plan = "free";
          updates.payment_subscription_id = null;
          updates.scan_count_this_period = 0;
          console.log(
            `[POLAR WEBHOOK] Subscription ${status}: user=${profile.id}, reverted to free`
          );
          trackEvent("plan_cancelled", profile.id, {
            reason: status,
          }).catch(() => {});
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from("profiles")
            .update(updates)
            .eq("id", profile.id);
        }

        break;
      }

      // ---------------------------------------------------------------
      // Subscription active (confirmed active/renewed)
      // ---------------------------------------------------------------
      case "subscription.active": {
        const subscriptionId = subscriptionData.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("payment_subscription_id", subscriptionId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              scan_count_this_period: 0,
              plan_period_start:
                subscriptionData.current_period_start ||
                new Date().toISOString(),
              plan_period_end:
                subscriptionData.current_period_end || null,
            })
            .eq("id", profile.id);

          console.log(
            `[POLAR WEBHOOK] Subscription active: user=${profile.id}, period reset`
          );
        }

        break;
      }

      // ---------------------------------------------------------------
      // Subscription canceled
      // ---------------------------------------------------------------
      case "subscription.canceled": {
        const subscriptionId = subscriptionData.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("payment_subscription_id", subscriptionId)
          .single();

        if (profile) {
          // If cancel_at_period_end, don't downgrade yet
          if (subscriptionData.cancel_at_period_end) {
            console.log(
              `[POLAR WEBHOOK] Subscription will cancel at period end: user=${profile.id}`
            );
          } else {
            await supabase
              .from("profiles")
              .update({
                plan: "free",
                payment_subscription_id: null,
                scan_count_this_period: 0,
              })
              .eq("id", profile.id);

            console.log(
              `[POLAR WEBHOOK] Subscription canceled immediately: user=${profile.id}`
            );
          }

          trackEvent("plan_cancelled", profile.id, {
            reason: "canceled",
          }).catch(() => {});
        }

        break;
      }

      // ---------------------------------------------------------------
      // Subscription uncanceled (reactivated before period end)
      // ---------------------------------------------------------------
      case "subscription.uncanceled": {
        const subscriptionId = subscriptionData.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("payment_subscription_id", subscriptionId)
          .single();

        if (profile) {
          console.log(
            `[POLAR WEBHOOK] Subscription reactivated: user=${profile.id}`
          );
          trackEvent("plan_reactivated", profile.id, {}).catch(
            () => {}
          );
        }

        break;
      }

      // ---------------------------------------------------------------
      // Subscription revoked (payment failed, access removed)
      // ---------------------------------------------------------------
      case "subscription.revoked": {
        const subscriptionId = subscriptionData.id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("payment_subscription_id", subscriptionId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              plan: "free",
              payment_subscription_id: null,
              scan_count_this_period: 0,
            })
            .eq("id", profile.id);

          if (profile.email) {
            sendPaymentFailedEmail(profile.email).catch(() => {});
          }

          console.log(
            `[POLAR WEBHOOK] Subscription revoked: user=${profile.id}`
          );
        }

        break;
      }

      default:
        console.log(`[POLAR WEBHOOK] Unhandled event: ${eventType}`);
    }
  } catch (error) {
    console.error(
      `[POLAR WEBHOOK] Error handling ${eventType}:`,
      error
    );
    // Still return 200 to prevent Polar from retrying
  }

  return NextResponse.json({ received: true });
}
