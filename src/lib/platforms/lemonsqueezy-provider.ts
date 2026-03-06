// ============================================================
// Lemon Squeezy Provider
// SDK: @lemonsqueezy/lemonsqueezy.js | Rate limit: 60 req/min (LOW!)
// Auth: Bearer API key | JSON:API format
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

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

// Rate limiter: 60 req/min = 1 req/second
let lastRequestTime = 0;
async function rateLimitedFetch(
  url: string,
  headers: Record<string, string>
): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
  return fetch(url, { headers });
}

export const lemonSqueezyProvider: BillingProvider = {
  platform: "lemonsqueezy",

  validateKeyFormat(apiKey: string) {
    if (apiKey.length < 30) {
      return {
        valid: false,
        error: "Lemon Squeezy API key appears too short",
      };
    }
    return { valid: true };
  },

  async validateConnection(apiKey: string) {
    const res = await fetch(`${LS_API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(
          "Invalid API key. Please check that you copied the full API key from Lemon Squeezy Settings."
        );
      }
      throw new Error(
        `Failed to connect to Lemon Squeezy: ${res.statusText}`
      );
    }
  },

  isTestMode(apiKey: string) {
    return apiKey.includes("test");
  },

  async fetchNormalizedData(
    apiKey: string,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<NormalizedBillingData> {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    };

    onProgress?.({
      step: "Fetching subscriptions from Lemon Squeezy...",
      progress: 10,
    });

    // Fetch subscriptions (JSON:API format)
    const subscriptionsRaw = await fetchAllLSPages(
      `${LS_API_BASE}/subscriptions`,
      headers
    );

    onProgress?.({
      step: "Fetching invoices and discounts...",
      progress: 30,
    });

    // Fetch subscription invoices, discounts, variants (prices), products
    // Note: 60 req/min — we fetch sequentially to stay within limits
    const invoicesRaw = await fetchAllLSPages(
      `${LS_API_BASE}/subscription-invoices`,
      headers
    );

    onProgress?.({ step: "Fetching products and pricing...", progress: 50 });

    const discountsRaw = await fetchAllLSPages(
      `${LS_API_BASE}/discounts`,
      headers
    );

    const variantsRaw = await fetchAllLSPages(
      `${LS_API_BASE}/variants`,
      headers
    );

    const productsRaw = await fetchAllLSPages(
      `${LS_API_BASE}/products`,
      headers
    );

    onProgress?.({ step: "Normalizing data...", progress: 60 });

    // Build discount lookup by ID
    const discountMap = new Map<string, NormalizedDiscount>();
    for (const d of discountsRaw) {
      const attrs = d.attributes as Record<string, unknown>;
      discountMap.set(d.id as string, {
        id: d.id as string,
        couponId: d.id as string,
        couponName: (attrs.name as string) || null,
        percentOff:
          attrs.amount_type === "percent" ? (attrs.amount as number) : null,
        amountOffCents:
          attrs.amount_type === "fixed" ? (attrs.amount as number) : null,
        duration: mapLSDuration(attrs.duration as string),
        durationInMonths: (attrs.duration_in_months as number) || null,
        redeemBy: null,
        endsAt: attrs.expires_at
          ? Math.floor(
              new Date(attrs.expires_at as string).getTime() / 1000
            )
          : null,
      });
    }

    // Normalize subscriptions
    const subscriptions: NormalizedSubscription[] = subscriptionsRaw.map(
      (sub: Record<string, unknown>) => {
        const attrs = sub.attributes as Record<string, unknown>;
        const status = mapLSStatus(attrs.status as string);

        // LS has price info directly on the subscription
        const variantId = attrs.variant_id as number | null;
        const firstItem = attrs.first_subscription_item as Record<string, unknown> | null;
        const priceAmount = (firstItem?.price as number) || 0;
        const interval = mapLSIntervalName(
          (firstItem?.interval as string) || "month"
        );

        const items = [
          {
            priceId: String(variantId || ""),
            productId: String(attrs.product_id || ""),
            unitAmountCents: priceAmount,
            quantity: 1,
            interval,
          },
        ];

        const monthlyAmountCents = normalizeIntervalToMonthly(
          priceAmount,
          interval
        );

        // Get discount
        const discounts: NormalizedDiscount[] = [];
        const discountId = attrs.discount_id as string | null;
        if (discountId && discountMap.has(String(discountId))) {
          discounts.push(discountMap.get(String(discountId))!);
        }

        // Payment method (partial — has brand/last4 but no expiry)
        const defaultPaymentMethod: NormalizedPaymentMethod | null =
          attrs.card_brand
            ? {
                id: "ls-card",
                type: "card",
                cardLast4: (attrs.card_last_four as string) || null,
                cardBrand: (attrs.card_brand as string) || null,
                cardExpMonth: null, // LS doesn't expose expiry
                cardExpYear: null,
              }
            : null;

        return {
          id: sub.id as string,
          platform: "lemonsqueezy" as const,
          status,
          customerId: String(attrs.customer_id || ""),
          customerEmail: (attrs.user_email as string) || null,
          monthlyAmountCents,
          items,
          discounts,
          defaultPaymentMethod,
          createdAt: attrs.created_at
            ? Math.floor(
                new Date(attrs.created_at as string).getTime() / 1000
              )
            : Math.floor(Date.now() / 1000),
          canceledAt: attrs.cancelled
            ? attrs.ends_at
              ? Math.floor(
                  new Date(attrs.ends_at as string).getTime() / 1000
                )
              : Math.floor(Date.now() / 1000)
            : null,
          pauseResumesAt: attrs.pause_resumes_at
            ? Math.floor(
                new Date(attrs.pause_resumes_at as string).getTime() / 1000
              )
            : null,
          platformUrl: `https://app.lemonsqueezy.com/subscriptions/${sub.id}`,
        };
      }
    );

    // Normalize subscription invoices
    const invoices: NormalizedInvoice[] = invoicesRaw
      .filter((inv: Record<string, unknown>) => {
        const attrs = inv.attributes as Record<string, unknown>;
        return attrs.status === "pending";
      })
      .map((inv: Record<string, unknown>) => {
        const attrs = inv.attributes as Record<string, unknown>;
        return {
          id: inv.id as string,
          platform: "lemonsqueezy" as const,
          number: null,
          status: "open" as const,
          amountDueCents: (attrs.total as number) || 0,
          amountRemainingCents: (attrs.total as number) || 0,
          customerId: String(attrs.customer_id || ""),
          customerEmail: null,
          subscriptionId: String(attrs.subscription_id || ""),
          attempted: true,
          dueDate: attrs.created_at
            ? Math.floor(
                new Date(attrs.created_at as string).getTime() / 1000
              )
            : null,
          createdAt: attrs.created_at
            ? Math.floor(
                new Date(attrs.created_at as string).getTime() / 1000
              )
            : Math.floor(Date.now() / 1000),
          nextPaymentAttempt: null,
          platformUrl: `https://app.lemonsqueezy.com/subscription-invoices/${inv.id}`,
        };
      });

    // Normalize products
    const products: NormalizedProduct[] = productsRaw.map(
      (p: Record<string, unknown>) => {
        const attrs = p.attributes as Record<string, unknown>;
        return {
          id: p.id as string,
          name: (attrs.name as string) || "",
          active: attrs.status === "published",
        };
      }
    );

    // Normalize variants as prices
    const prices: NormalizedPrice[] = variantsRaw.map(
      (v: Record<string, unknown>) => {
        const attrs = v.attributes as Record<string, unknown>;
        return {
          id: v.id as string,
          productId: String(attrs.product_id || ""),
          unitAmountCents: (attrs.price as number) || 0,
          interval: attrs.is_subscription
            ? mapLSIntervalName(attrs.interval as string)
            : "month",
          active: attrs.status === "published",
          createdAt: attrs.created_at
            ? Math.floor(
                new Date(attrs.created_at as string).getTime() / 1000
              )
            : Math.floor(Date.now() / 1000),
        };
      }
    );

    return {
      platform: "lemonsqueezy",
      subscriptions,
      invoices,
      prices,
      products,
      paymentMethods: new Map<string, NormalizedPaymentMethod[]>(),
    };
  },
};

// --- Helpers ---

function mapLSStatus(status: string): NormalizedSubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "on_trial":
      return "trialing";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "paused":
      return "paused";
    case "cancelled":
      return "canceled";
    case "expired":
      return "incomplete_expired";
    default:
      return "canceled";
  }
}

function mapLSDuration(
  duration: string
): "once" | "repeating" | "forever" {
  switch (duration) {
    case "once":
      return "once";
    case "repeating":
      return "repeating";
    case "forever":
      return "forever";
    default:
      return "once";
  }
}

function mapLSIntervalName(
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

async function fetchAllLSPages(
  baseUrl: string,
  headers: Record<string, string>
): Promise<Array<Record<string, unknown>>> {
  const allItems: Array<Record<string, unknown>> = [];
  let url: string | null = `${baseUrl}?page[size]=100`;

  while (url) {
    const res = await rateLimitedFetch(url, headers);

    if (!res.ok) {
      throw new Error(
        `Lemon Squeezy API error: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    const items = data.data || [];

    if (Array.isArray(items)) {
      allItems.push(...items);
    }

    // JSON:API pagination
    url = data.links?.next || data.meta?.page?.lastPage
      ? data.links?.next || null
      : null;
  }

  return allItems;
}
