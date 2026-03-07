// ============================================================
// Paddle Provider
// SDK: @paddle/paddle-node-sdk | Rate limit: 240 req/min
// Auth: Bearer API key
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

const PADDLE_API_BASE = "https://api.paddle.com";

export const paddleProvider: BillingProvider = {
  platform: "paddle",

  validateKeyFormat(apiKey: string) {
    if (apiKey.length < 20) {
      return {
        valid: false,
        error: "Paddle API key appears too short",
      };
    }
    return { valid: true };
  },

  async validateConnection(apiKey: string) {
    const res = await fetch(`${PADDLE_API_BASE}/event-types`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error(
          "Invalid API key. Please check that you copied the full API key from Paddle."
        );
      }
      throw new Error(`Failed to connect to Paddle: ${res.statusText}`);
    }
  },

  isTestMode(apiKey: string) {
    // Paddle sandbox uses a different base URL, but keys look the same
    // We check if the key starts with "test_" or "pdl_sbox_"
    return (
      apiKey.startsWith("test_") || apiKey.includes("sbox")
    );
  },

  async fetchNormalizedData(
    apiKey: string,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<NormalizedBillingData> {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    onProgress?.({
      step: "Fetching subscriptions from Paddle...",
      progress: 10,
    });

    // Fetch subscriptions
    const subscriptionsRaw = await fetchAllPaddlePages(
      `${PADDLE_API_BASE}/subscriptions`,
      headers
    );

    onProgress?.({ step: "Fetching transactions and prices...", progress: 40 });

    // Fetch transactions (past_due), prices, products, discounts in parallel
    const [transactionsRaw, pricesRaw, productsRaw, discountsRaw] =
      await Promise.all([
        fetchAllPaddlePages(
          `${PADDLE_API_BASE}/transactions?status=past_due,billed`,
          headers
        ),
        fetchAllPaddlePages(`${PADDLE_API_BASE}/prices`, headers),
        fetchAllPaddlePages(`${PADDLE_API_BASE}/products`, headers),
        fetchAllPaddlePages(`${PADDLE_API_BASE}/discounts`, headers),
      ]);

    onProgress?.({ step: "Fetching payment methods...", progress: 55 });

    // Fetch payment methods for each unique customer with active/trialing subs
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
            const methods = await fetchAllPaddlePages(
              `${PADDLE_API_BASE}/customers/${customerId}/payment-methods`,
              headers
            );
            return { customerId, methods };
          } catch {
            // Customer might not have payment methods — skip gracefully
            return { customerId, methods: [] };
          }
        })
      );

      for (const { customerId, methods } of results) {
        const normalized: NormalizedPaymentMethod[] = methods
          .filter(
            (m: Record<string, unknown>) =>
              m.type === "card" && (m.card as Record<string, unknown> | null)
          )
          .map((m: Record<string, unknown>) => {
            const card = m.card as Record<string, unknown>;
            return {
              id: (m.id as string) || "",
              type: "card" as const,
              cardLast4: (card.last4 as string) || null,
              cardBrand: (card.type as string) || null,
              cardExpMonth: (card.expiry_month as number) || null,
              cardExpYear: (card.expiry_year as number) || null,
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
        couponName: (d.description as string) || (d.code as string) || null,
        percentOff: d.type === "percentage" ? (parseFloat(d.amount as string) || 0) : null,
        amountOffCents:
          d.type === "flat" || d.type === "flat_per_unit"
            ? Math.round((parseFloat(d.amount as string) || 0) * 100)
            : null,
        duration:
          d.recur && !(d.maximum_recurring_intervals as number | null)
            ? "forever"
            : d.recur
              ? "repeating"
              : "once",
        durationInMonths: (d.maximum_recurring_intervals as number) || null,
        redeemBy: null,
        endsAt: d.expires_at
          ? Math.floor(new Date(d.expires_at as string).getTime() / 1000)
          : null,
      });
    }

    // Normalize subscriptions
    const subscriptions: NormalizedSubscription[] = subscriptionsRaw.map(
      (sub: Record<string, unknown>) => {
        const items =
          ((sub.items as Array<Record<string, unknown>>) || []).map(
            (item: Record<string, unknown>) => {
              const price = item.price as Record<string, unknown>;
              const billingCycle = price?.billing_cycle as Record<
                string,
                unknown
              > | null;
              const unitPrice = price?.unit_price as Record<string, unknown> | undefined;
              return {
                priceId: (price?.id as string) || "",
                productId: (price?.product_id as string) || "",
                unitAmountCents: Math.round(
                  parseFloat((unitPrice?.amount as string) || "0") || 0
                ),
                quantity: (item.quantity as number) || 1,
                interval: mapPaddleInterval(
                  billingCycle?.interval as string
                ),
              };
            }
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

        // Get discount if present
        const discounts: NormalizedDiscount[] = [];
        const discountId = (sub.discount as Record<string, unknown> | undefined)?.id as string | undefined;
        if (discountId && discountMap.has(discountId)) {
          discounts.push(discountMap.get(discountId)!);
        }

        return {
          id: sub.id as string,
          platform: "paddle" as const,
          status: mapPaddleStatus(sub.status as string),
          customerId: (sub.customer_id as string) || "",
          customerEmail: null,
          monthlyAmountCents,
          items,
          discounts,
          defaultPaymentMethod:
            paymentMethods.get((sub.customer_id as string) || "")?.[0] ?? null,
          createdAt: sub.created_at
            ? Math.floor(new Date(sub.created_at as string).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          canceledAt: sub.canceled_at
            ? Math.floor(
                new Date(sub.canceled_at as string).getTime() / 1000
              )
            : null,
          pauseResumesAt: getScheduledResumeDate(sub),
          platformUrl: `https://vendors.paddle.com/subscriptions/${sub.id}`,
        };
      }
    );

    // Normalize transactions as invoices
    const invoices: NormalizedInvoice[] = transactionsRaw
      .filter(
        (t: Record<string, unknown>) =>
          t.status === "past_due" || t.status === "billed"
      )
      .map((tx: Record<string, unknown>) => {
        const total = Math.round(
          parseFloat(
            ((tx.details as Record<string, unknown>)?.totals as Record<string, unknown>)?.total as string ||
              "0"
          )
        );
        return {
          id: tx.id as string,
          platform: "paddle" as const,
          number: (tx.invoice_number as string) || null,
          status: "open" as const,
          amountDueCents: total,
          amountRemainingCents: total,
          customerId: (tx.customer_id as string) || "",
          customerEmail: null,
          subscriptionId: (tx.subscription_id as string) || null,
          attempted: true,
          dueDate: tx.created_at
            ? Math.floor(new Date(tx.created_at as string).getTime() / 1000)
            : null,
          createdAt: tx.created_at
            ? Math.floor(new Date(tx.created_at as string).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          nextPaymentAttempt: null,
          platformUrl: `https://vendors.paddle.com/transactions/${tx.id}`,
        };
      });

    // Normalize products and prices
    const products: NormalizedProduct[] = productsRaw.map(
      (p: Record<string, unknown>) => ({
        id: p.id as string,
        name: (p.name as string) || "",
        active: p.status === "active",
      })
    );

    const prices: NormalizedPrice[] = pricesRaw
      .filter(
        (p: Record<string, unknown>) =>
          (p.billing_cycle as Record<string, unknown> | null) !== null
      )
      .map((p: Record<string, unknown>) => {
        const billingCycle = p.billing_cycle as Record<string, unknown>;
        const unitPrice = p.unit_price as Record<string, unknown> | undefined;
        return {
          id: p.id as string,
          productId: (p.product_id as string) || "",
          unitAmountCents: Math.round(
            parseFloat((unitPrice?.amount as string) || "0")
          ),
          interval: mapPaddleInterval(billingCycle?.interval as string),
          active: p.status === "active",
          createdAt: p.created_at
            ? Math.floor(new Date(p.created_at as string).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
        };
      });

    return {
      platform: "paddle",
      subscriptions,
      invoices,
      prices,
      products,
      paymentMethods,
    };
  },
};

// --- Helpers ---

function mapPaddleStatus(status: string): NormalizedSubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
      return "canceled";
    default:
      return "canceled";
  }
}

function mapPaddleInterval(
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

function getScheduledResumeDate(
  sub: Record<string, unknown>
): number | null {
  const scheduled = sub.scheduled_change as Record<string, unknown> | null;
  if (scheduled?.action === "resume" && scheduled?.effective_at) {
    return Math.floor(
      new Date(scheduled.effective_at as string).getTime() / 1000
    );
  }
  return null;
}

async function fetchAllPaddlePages(
  baseUrl: string,
  headers: Record<string, string>
): Promise<Array<Record<string, unknown>>> {
  const allItems: Array<Record<string, unknown>> = [];
  let url: string | null = baseUrl;

  while (url) {
    const res: Response = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`Paddle API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.data || [];

    if (Array.isArray(items)) {
      allItems.push(...items);
    }

    // Paddle uses cursor-based pagination via meta.pagination.next
    url = (data.meta?.pagination?.next as string | null) || null;
  }

  return allItems;
}
