import Stripe from "stripe";
import {
  Leak,
  LeakType,
  LeakCategorySummary,
  ScanReport,
  LEAK_TYPE_LABELS,
  SEVERITY_ORDER,
} from "./types";
import { generateReportId, calculateHealthScore } from "./utils";
import { scanExpiredCoupons } from "./scanners/expired-coupons";
import { scanNeverExpiringDiscounts } from "./scanners/never-expiring-discounts";
import { scanFailedPayments } from "./scanners/failed-payments";
import { scanExpiringCards } from "./scanners/expiring-cards";
import { scanGhostSubscriptions } from "./scanners/ghost-subscriptions";
import { scanLegacyPricing } from "./scanners/legacy-pricing";
import { scanMissingPaymentMethods } from "./scanners/missing-payment-methods";

export interface ScanProgress {
  step: string;
  progress: number;
}

type ProgressCallback = (progress: ScanProgress) => void;

/**
 * Auto-paginate through all Stripe list results.
 * Returns an array of all items across all pages.
 */
async function fetchAll<T extends { id: string }>(
  listFn: (params: Stripe.PaginationParams) => Stripe.ApiListPromise<T>,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const allItems: T[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await listFn({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
      ...params,
    } as Stripe.PaginationParams);

    allItems.push(...response.data);
    hasMore = response.has_more;

    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return allItems;
}

/**
 * Validate the Stripe API key by attempting to retrieve the balance.
 * Returns the Stripe instance if valid, throws descriptive error if not.
 */
async function validateAndCreateStripe(apiKey: string): Promise<Stripe> {
  const stripe = new Stripe(apiKey, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    await stripe.balance.retrieve();
    return stripe;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      throw new Error(
        "Invalid API key. Please check that you copied the full restricted key from Stripe."
      );
    }
    if (error instanceof Stripe.errors.StripePermissionError) {
      throw new Error(
        "This API key doesn't have the required permissions. Please ensure read access is enabled for: Subscriptions, Customers, Invoices, Products, Prices, Coupons, and Payment Methods."
      );
    }
    throw new Error(
      `Failed to connect to Stripe: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch all required data from Stripe in parallel batches.
 */
async function fetchStripeData(
  stripe: Stripe,
  onProgress?: ProgressCallback
) {
  onProgress?.({ step: "Fetching subscriptions...", progress: 10 });

  // Batch 1: Subscriptions (with expanded data) + Invoices + Products
  const [subscriptions, invoices, products] = await Promise.all([
    fetchAll(
      (params) =>
        stripe.subscriptions.list({
          ...params,
          status: "all",
          expand: [
            "data.discounts",
            "data.default_payment_method",
            "data.customer",
          ],
        } as Stripe.SubscriptionListParams),
      {}
    ),
    fetchAll(
      (params) =>
        stripe.invoices.list({
          ...params,
          status: "open",
          expand: ["data.customer"],
        } as Stripe.InvoiceListParams),
      {}
    ),
    fetchAll(
      (params) =>
        stripe.products.list(params as Stripe.ProductListParams),
      {}
    ),
  ]);

  onProgress?.({ step: "Fetching prices and coupons...", progress: 40 });

  // Batch 2: Prices + Coupons
  const [prices, coupons] = await Promise.all([
    fetchAll(
      (params) =>
        stripe.prices.list({
          ...params,
          active: true,
          type: "recurring",
        } as Stripe.PriceListParams),
      {}
    ),
    fetchAll(
      (params) =>
        stripe.coupons.list(params as Stripe.CouponListParams),
      {}
    ),
  ]);

  onProgress?.({ step: "Fetching payment methods...", progress: 60 });

  // Batch 3: Payment methods for each unique customer with active subs
  const activeCustomerIds = new Set<string>();
  for (const sub of subscriptions) {
    if (sub.status === "active" || sub.status === "trialing") {
      const customerId =
        typeof sub.customer === "string"
          ? sub.customer
          : sub.customer.id;
      activeCustomerIds.add(customerId);
    }
  }

  const paymentMethods = new Map<string, Stripe.PaymentMethod[]>();

  // Fetch payment methods in parallel batches of 10 customers
  const customerIds = Array.from(activeCustomerIds);
  const batchSize = 10;

  for (let i = 0; i < customerIds.length; i += batchSize) {
    const batch = customerIds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (customerId) => {
        try {
          const methods = await stripe.paymentMethods.list({
            customer: customerId,
            type: "card",
            limit: 10,
          });
          return { customerId, methods: methods.data };
        } catch {
          return { customerId, methods: [] };
        }
      })
    );

    for (const { customerId, methods } of results) {
      paymentMethods.set(customerId, methods);
    }
  }

  return {
    subscriptions,
    invoices,
    products,
    prices,
    coupons,
    paymentMethods,
  };
}

/**
 * Calculate total MRR from all active subscriptions.
 */
function calculateTotalMRR(subscriptions: Stripe.Subscription[]): number {
  let totalMRR = 0;

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    for (const item of sub.items.data) {
      const price = item.price;
      if (!price.unit_amount) continue;
      const amount = price.unit_amount * (item.quantity || 1);

      switch (price.recurring?.interval) {
        case "month":
          totalMRR += amount;
          break;
        case "year":
          totalMRR += Math.round(amount / 12);
          break;
        case "week":
          totalMRR += Math.round(amount * 4.33);
          break;
        case "day":
          totalMRR += Math.round(amount * 30);
          break;
        default:
          totalMRR += amount;
      }
    }
  }

  return totalMRR;
}

/**
 * Count unique customers from subscriptions.
 */
function countUniqueCustomers(subscriptions: Stripe.Subscription[]): number {
  const customers = new Set<string>();
  for (const sub of subscriptions) {
    const id =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    customers.add(id);
  }
  return customers.size;
}

/**
 * Build category summaries from the leak list.
 */
function buildCategorySummaries(
  leaks: Leak[],
  totalMrrAtRisk: number
): LeakCategorySummary[] {
  const categoryMap = new Map<LeakType, { count: number; impact: number }>();

  for (const leak of leaks) {
    const existing = categoryMap.get(leak.type) || {
      count: 0,
      impact: 0,
    };
    existing.count += 1;
    existing.impact += leak.monthlyImpact;
    categoryMap.set(leak.type, existing);
  }

  const categories: LeakCategorySummary[] = [];
  for (const [type, data] of categoryMap) {
    categories.push({
      type,
      label: LEAK_TYPE_LABELS[type],
      count: data.count,
      totalMonthlyImpact: data.impact,
      percentage:
        totalMrrAtRisk > 0
          ? Math.round((data.impact / totalMrrAtRisk) * 100)
          : 0,
    });
  }

  // Sort by impact descending
  categories.sort((a, b) => b.totalMonthlyImpact - a.totalMonthlyImpact);

  return categories;
}

/**
 * Main scan function. Orchestrates the full Stripe billing audit.
 */
export interface StripeScanResult {
  report: ScanReport;
  emailMap: Map<string, string>;
}

export async function runFullScan(
  apiKey: string,
  onProgress?: ProgressCallback
): Promise<StripeScanResult> {
  // Step 1: Validate API key and create Stripe instance
  onProgress?.({ step: "Validating API key...", progress: 5 });
  const stripe = await validateAndCreateStripe(apiKey);

  // Step 2: Fetch all data from Stripe
  const data = await fetchStripeData(stripe, onProgress);

  // Step 3: Run all 10 scanners
  onProgress?.({ step: "Analyzing subscriptions...", progress: 70 });

  const allLeaks: Leak[] = [
    ...scanExpiredCoupons(data.subscriptions),
    ...scanNeverExpiringDiscounts(data.subscriptions),
    ...scanFailedPayments(data.invoices),
    ...scanExpiringCards(data.subscriptions, data.paymentMethods),
    ...scanGhostSubscriptions(data.subscriptions),
    ...scanLegacyPricing(data.subscriptions, data.prices, data.products),
    ...scanMissingPaymentMethods(data.subscriptions, data.paymentMethods),
  ];

  // Step 3b: Build emailMap from expanded customer data (before masking)
  const emailMap = new Map<string, string>();
  for (const sub of data.subscriptions) {
    const cust = sub.customer;
    if (typeof cust !== "string" && cust && !("deleted" in cust && cust.deleted) && cust.email) {
      emailMap.set(cust.id, cust.email);
    }
  }
  for (const inv of data.invoices) {
    const cust = inv.customer;
    if (typeof cust !== "string" && cust && !("deleted" in cust && cust.deleted) && cust.email && !emailMap.has(cust.id)) {
      emailMap.set(cust.id, cust.email);
    }
  }

  onProgress?.({ step: "Building report...", progress: 90 });

  // Step 4: Sort leaks by severity (critical first)
  allLeaks.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  // Step 5: Calculate metrics
  const totalMRR = calculateTotalMRR(data.subscriptions);
  const mrrAtRisk = allLeaks.reduce((sum, l) => sum + l.monthlyImpact, 0);
  const healthScore = calculateHealthScore(allLeaks, totalMRR);

  // Step 6: Build category summaries
  const categories = buildCategorySummaries(allLeaks, mrrAtRisk);

  // Step 7: Build final report
  const report: ScanReport = {
    id: generateReportId(),
    scannedAt: new Date().toISOString(),
    summary: {
      mrrAtRisk,
      leaksFound: allLeaks.length,
      recoveryPotential: mrrAtRisk * 12,
      totalSubscriptions: data.subscriptions.length,
      totalCustomers: countUniqueCustomers(data.subscriptions),
      totalMRR,
      healthScore,
    },
    categories,
    leaks: allLeaks,
  };

  onProgress?.({ step: "Scan complete!", progress: 100 });

  return { report, emailMap };
}
