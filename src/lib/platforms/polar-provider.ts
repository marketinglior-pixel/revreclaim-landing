// ============================================================
// Polar.sh Provider
// SDK: @polar-sh/sdk | Rate limit: 300 req/min
// Auth: Organization Access Token (Bearer polar_oat_xxx)
// ============================================================

import { BillingProvider, ScanProgress } from "./provider";
import {
  NormalizedBillingData,
  NormalizedSubscription,
  NormalizedInvoice,
  NormalizedPrice,
  NormalizedProduct,
  NormalizedDiscount,
  NormalizedPaymentMethod,
  NormalizedSubscriptionStatus,
  normalizeIntervalToMonthly,
} from "./types";

export const polarProvider: BillingProvider = {
  platform: "polar",

  validateKeyFormat(apiKey: string) {
    if (!apiKey.startsWith("polar_oat_")) {
      return {
        valid: false,
        error:
          "Must be a Polar Organization Access Token (starts with polar_oat_)",
      };
    }
    return { valid: true };
  },

  async validateConnection(apiKey: string) {
    // Validate by hitting /v1/products with limit=1 — this requires only
    // the products:read scope which every scanner token should have.
    // NOTE: /v1/oauth2/userinfo only works with OAuth2 user tokens (polar_at_)
    // and /v1/organizations/ requires organizations:read scope which users
    // may not grant. Using a data endpoint we need anyway is safest.
    const res = await fetch("https://api.polar.sh/v1/products/?limit=1", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(
          "Invalid API token. Please check that you copied the full Organization Access Token from Polar."
        );
      }
      if (res.status === 403) {
        throw new Error(
          "Token is missing required permissions. Please make sure your Polar token has at least: products:read, subscriptions:read, orders:read, and discounts:read."
        );
      }
      throw new Error(`Failed to connect to Polar: ${res.statusText}`);
    }
  },

  isTestMode(_apiKey: string) {
    return false; // Polar doesn't have explicit test mode keys
  },

  async fetchNormalizedData(
    apiKey: string,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<NormalizedBillingData> {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    onProgress?.({ step: "Fetching subscriptions from Polar...", progress: 10 });

    // Fetch all subscriptions
    const subscriptionsRaw = await fetchAllPages(
      "https://api.polar.sh/v1/subscriptions/",
      headers
    );

    onProgress?.({ step: "Fetching orders and discounts...", progress: 40 });

    // Fetch orders (as invoices) and discounts in parallel
    const [ordersRaw, discountsRaw, productsRaw] = await Promise.all([
      fetchAllPages(
        "https://api.polar.sh/v1/orders/?billing_type=recurring",
        headers
      ),
      fetchAllPages("https://api.polar.sh/v1/discounts/", headers),
      fetchAllPages("https://api.polar.sh/v1/products/", headers),
    ]);

    onProgress?.({ step: "Fetching payment methods...", progress: 55 });

    // Fetch payment methods for each unique customer with active/trialing subs.
    // Polar requires a Customer Session token per customer to access payment methods:
    //   1. POST /v1/customer-sessions/  (OAT auth) → get customer session token
    //   2. GET /v1/customer-portal/customers/me/payment-methods  (customer token auth)
    const activeCustomerIds = [
      ...new Set(
        subscriptionsRaw
          .filter(
            (s: Record<string, unknown>) =>
              s.status === "active" || s.status === "trialing"
          )
          .map((s: Record<string, unknown>) => s.customer_id as string)
          .filter(Boolean)
      ),
    ];

    const paymentMethods = new Map<string, NormalizedPaymentMethod[]>();
    const PM_BATCH_SIZE = 10;

    for (let i = 0; i < activeCustomerIds.length; i += PM_BATCH_SIZE) {
      const batch = activeCustomerIds.slice(i, i + PM_BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (customerId) => {
          try {
            // Step 1: Create a customer session
            const sessionRes = await fetch(
              "https://api.polar.sh/v1/customer-sessions/",
              {
                method: "POST",
                headers,
                body: JSON.stringify({ customer_id: customerId }),
              }
            );
            if (!sessionRes.ok) return { customerId, methods: [] };
            const session = await sessionRes.json();
            const customerToken = session.token as string;
            if (!customerToken) return { customerId, methods: [] };

            // Step 2: Use customer token to fetch payment methods
            const pmRes = await fetch(
              "https://api.polar.sh/v1/customer-portal/customers/me/payment-methods?limit=10",
              {
                headers: {
                  Authorization: `Bearer ${customerToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (!pmRes.ok) return { customerId, methods: [] };
            const pmData = await pmRes.json();
            const items = pmData.items || [];

            return { customerId, methods: items as Array<Record<string, unknown>> };
          } catch {
            // Skip gracefully — customer session creation may fail
            return { customerId, methods: [] };
          }
        })
      );

      for (const { customerId, methods } of results) {
        const normalized: NormalizedPaymentMethod[] = methods
          .filter((m: Record<string, unknown>) => m.type === "card")
          .map((m: Record<string, unknown>) => {
            const meta = m.method_metadata as Record<string, unknown> | null;
            return {
              id: (m.id as string) || "",
              type: "card" as const,
              cardLast4: (meta?.last4 as string) || null,
              cardBrand: (meta?.brand as string) || null,
              cardExpMonth: (meta?.exp_month as number) || null,
              cardExpYear: (meta?.exp_year as number) || null,
            };
          });

        if (normalized.length > 0) {
          paymentMethods.set(customerId, normalized);
        }
      }
    }

    onProgress?.({ step: "Normalizing data...", progress: 60 });

    // Build discount lookup
    const discountMap = new Map<string, NormalizedDiscount>();
    for (const d of discountsRaw) {
      discountMap.set(d.id as string, {
        id: d.id as string,
        couponId: d.id as string,
        couponName: (d.name as string) || null,
        percentOff: d.type === "percentage" ? (d.amount as number) : null,
        amountOffCents: d.type === "fixed" ? (d.amount as number) : null,
        duration: mapPolarDuration(d.duration as string),
        durationInMonths: (d.duration_in_months as number) || null,
        redeemBy: null,
        endsAt: d.ends_at ? Math.floor(new Date(d.ends_at as string).getTime() / 1000) : null,
      });
    }

    // Normalize subscriptions
    const subscriptions: NormalizedSubscription[] = subscriptionsRaw.map(
      (sub: Record<string, unknown>) => {
        const status = mapPolarStatus(sub.status as string);
        const items = (sub.prices as Array<Record<string, unknown>> || []).map(
          (p: Record<string, unknown>) => ({
            priceId: p.id as string,
            productId: (p.product_id as string) || "",
            unitAmountCents: (p.price_amount as number) || 0,
            quantity: (sub.seats as number) || 1,
            interval: mapPolarInterval(sub.recurring_interval as string),
          })
        );

        const monthlyAmountCents = items.reduce(
          (sum, item) =>
            sum +
            normalizeIntervalToMonthly(
              item.unitAmountCents * item.quantity,
              item.interval
            ),
          0
        );

        const discounts: NormalizedDiscount[] = [];
        if (sub.discount_id && discountMap.has(sub.discount_id as string)) {
          discounts.push(discountMap.get(sub.discount_id as string)!);
        }

        return {
          id: sub.id as string,
          platform: "polar" as const,
          status,
          customerId: (sub.customer_id as string) || "",
          customerEmail: (sub.customer_email as string) || null,
          monthlyAmountCents,
          items,
          discounts,
          defaultPaymentMethod:
            paymentMethods.get((sub.customer_id as string) || "")?.[0] ?? null,
          createdAt: sub.started_at
            ? Math.floor(new Date(sub.started_at as string).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          canceledAt: sub.canceled_at
            ? Math.floor(new Date(sub.canceled_at as string).getTime() / 1000)
            : null,
          pauseResumesAt: null,
          platformUrl: `https://polar.sh/dashboard/subscriptions/${sub.id}`,
        };
      }
    );

    // Normalize orders as invoices
    const invoices: NormalizedInvoice[] = ordersRaw
      .filter((o: Record<string, unknown>) => o.status === "pending")
      .map((order: Record<string, unknown>) => ({
        id: order.id as string,
        platform: "polar" as const,
        number: null,
        status: "open" as const,
        amountDueCents: (order.net_amount as number) || 0,
        amountRemainingCents: (order.net_amount as number) || 0,
        customerId: (order.customer_id as string) || "",
        customerEmail: null,
        subscriptionId: (order.subscription_id as string) || null,
        attempted: true,
        dueDate: order.created_at
          ? Math.floor(new Date(order.created_at as string).getTime() / 1000)
          : null,
        createdAt: order.created_at
          ? Math.floor(new Date(order.created_at as string).getTime() / 1000)
          : Math.floor(Date.now() / 1000),
        nextPaymentAttempt: null,
        platformUrl: `https://polar.sh/dashboard/orders/${order.id}`,
      }));

    // Normalize products and prices
    const products: NormalizedProduct[] = productsRaw.map(
      (p: Record<string, unknown>) => ({
        id: p.id as string,
        name: (p.name as string) || "",
        active: p.is_archived !== true,
      })
    );

    const prices: NormalizedPrice[] = [];
    for (const product of productsRaw) {
      const productPrices = (product.prices as Array<Record<string, unknown>>) || [];
      for (const p of productPrices) {
        prices.push({
          id: p.id as string,
          productId: product.id as string,
          unitAmountCents: (p.price_amount as number) || 0,
          interval: mapPolarInterval(p.recurring_interval as string),
          active: true,
          createdAt: p.created_at
            ? Math.floor(new Date(p.created_at as string).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
        });
      }
    }

    return {
      platform: "polar",
      subscriptions,
      invoices,
      prices,
      products,
      paymentMethods,
    };
  },
};

// --- Helpers ---

function mapPolarStatus(status: string): NormalizedSubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "canceled":
      return "canceled";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    default:
      return "canceled";
  }
}

function mapPolarInterval(
  interval: string
): "day" | "week" | "month" | "year" {
  switch (interval) {
    case "day":
      return "day";
    case "week":
      return "week";
    case "month":
      return "month";
    case "year":
      return "year";
    default:
      return "month";
  }
}

function mapPolarDuration(
  duration: string
): "once" | "repeating" | "forever" {
  switch (duration) {
    case "once":
      return "once";
    case "several_months":
    case "repeating":
      return "repeating";
    case "forever":
      return "forever";
    default:
      return "once";
  }
}

async function fetchAllPages(
  baseUrl: string,
  headers: Record<string, string>
): Promise<Array<Record<string, unknown>>> {
  const allItems: Array<Record<string, unknown>> = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const url = `${baseUrl}${separator}page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`Polar API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || data.result || [];

    if (!Array.isArray(items) || items.length === 0) break;

    allItems.push(...items);

    if (items.length < limit) break;
    page++;
  }

  return allItems;
}
