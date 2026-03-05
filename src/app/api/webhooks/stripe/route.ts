import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getServiceClient, getPlanFromPriceId } from "@/lib/stripe-billing";
import { sendUpgradeConfirmationEmail, sendPaymentFailedEmail } from "@/lib/email";
import { trackEvent } from "@/lib/analytics";
import type Stripe from "stripe";

// Disable body parsing — we need the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("[STRIPE WEBHOOK] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "pro" | "team" | undefined;

        if (!userId || !plan) {
          console.error("[STRIPE WEBHOOK] Missing metadata in checkout session:", session.id);
          break;
        }

        console.log(`[STRIPE WEBHOOK] Checkout completed: user=${userId}, plan=${plan}`);

        await supabase
          .from("profiles")
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            scan_count_this_period: 0,
          })
          .eq("id", userId);

        // Track upgrade event + send confirmation email
        trackEvent("plan_upgraded", userId, { plan }).catch(() => {});

        const customerEmail = session.customer_details?.email || session.customer_email;
        if (customerEmail) {
          sendUpgradeConfirmationEmail(customerEmail, plan).catch(() => {});
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Try to find user by stripe_customer_id
          const customerId = subscription.customer as string;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (!profile) {
            console.error("[STRIPE WEBHOOK] No profile found for customer:", customerId);
            break;
          }

          // Determine the new plan from the price
          const priceId = subscription.items.data[0]?.price?.id;
          const newPlan = priceId ? getPlanFromPriceId(priceId) : null;

          if (newPlan) {
            await supabase
              .from("profiles")
              .update({
                plan: newPlan,
                stripe_subscription_id: subscription.id,
              })
              .eq("id", profile.id);

            console.log(`[STRIPE WEBHOOK] Subscription updated: user=${profile.id}, plan=${newPlan}`);
          }
          break;
        }

        // Has userId in metadata
        const priceId = subscription.items.data[0]?.price?.id;
        const newPlan = priceId ? getPlanFromPriceId(priceId) : null;

        if (newPlan) {
          await supabase
            .from("profiles")
            .update({
              plan: newPlan,
              stripe_subscription_id: subscription.id,
            })
            .eq("id", userId);

          console.log(`[STRIPE WEBHOOK] Subscription updated: user=${userId}, plan=${newPlan}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              plan: "free",
              stripe_subscription_id: null,
              scan_count_this_period: 0,
            })
            .eq("id", profile.id);

          console.log(`[STRIPE WEBHOOK] Subscription cancelled: user=${profile.id}, reverted to free`);
          trackEvent("plan_cancelled", profile.id, { customerId }).catch(() => {});
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const periodStart = invoice.period_start
          ? new Date(invoice.period_start * 1000).toISOString()
          : null;
        const periodEnd = invoice.period_end
          ? new Date(invoice.period_end * 1000).toISOString()
          : null;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              scan_count_this_period: 0,
              plan_period_start: periodStart,
              plan_period_end: periodEnd,
            })
            .eq("id", profile.id);

          console.log(`[STRIPE WEBHOOK] Payment succeeded: user=${profile.id}, period reset`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.warn(`[STRIPE WEBHOOK] Payment failed for customer: ${customerId}`);

        // Send payment failure email
        const { data: failedProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (failedProfile?.email) {
          sendPaymentFailedEmail(failedProfile.email).catch(() => {});
        }
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[STRIPE WEBHOOK] Error handling ${event.type}:`, error);
    // Still return 200 to prevent Stripe from retrying
  }

  return NextResponse.json({ received: true });
}
