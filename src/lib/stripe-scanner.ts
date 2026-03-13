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
import { scanStuckSubscriptions } from "./scanners/stuck-subscriptions";
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
 * Validate the Stripe API key by testing actual required resources.
 * Returns the Stripe instance if valid, throws descriptive error if not.
 */
async function validateAndCreateStripe(apiKey: string): Promise<Stripe> {
  const stripe = new Stripe(apiKey, {
    apiVersion: "2026-02-25.clover",
  });

  // Test with subscriptions.list — a permission we actually need
  try {
    await stripe.subscriptions.list({ limit: 1 });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      throw new Error(
        "Invalid API key. Please check that you copied the full restricted key from Stripe."
      );
    }
    if (error instanceof Stripe.errors.StripePermissionError) {
      throw new Error(
        "This API key is missing Subscriptions read access. Please enable it in your Stripe Dashboard under Developers → API Keys."
      );
    }
    throw new Error(
      `Failed to connect to Stripe: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  return stripe;
}

/**
 * Fetch all required data from Stripe in parallel batches.
 * Gracefully handles missing Customers read permission.
 */
async function fetchStripeData(
  stripe: Stripe,
  onProgress?: ProgressCallback
) {
  onProgress?.({ step: "Fetching subscriptions...", progress: 10 });

  let hasCustomerAccess = true;

  // Batch 1: Subscriptions (with expanded data) + Invoices + Products
  let subscriptions: Stripe.Subscription[];
  let invoices: Stripe.Invoice[];
  let products: Stripe.Product[];

  try {
    [subscriptions, invoices, products] = await Promise.all([
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
  } catch (error) {
    // If Customers permission is missing, retry without customer expansion
    if (error instanceof Stripe.errors.StripePermissionError) {
      hasCustomerAccess = false;
      [subscriptions, invoices, products] = await Promise.all([
        fetchAll(
          (params) =>
            stripe.subscriptions.list({
              ...params,
              status: "all",
              expand: [
                "data.discounts",
                "data.default_payment_method",
              ],
            } as Stripe.SubscriptionListParams),
          {}
        ),
        fetchAll(
          (params) =>
            stripe.invoices.list({
              ...params,
              status: "open",
            } as Stripe.InvoiceListParams),
          {}
        ),
        fetchAll(
          (params) =>
            stripe.products.list(params as Stripe.ProductListParams),
          {}
        ),
      ]);
    } else {
      throw error;
    }
  }

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
    hasCustomerAccess,
  };
}

/**
 * Calculate MRR from subscriptions.
 * Returns active MRR (matches Stripe's definition) and trialing MRR separately.
 */
function calculateMRR(subscriptions: Stripe.Subscription[]): {
  activeMRR: number;
  trialingMRR: number;
} {
  let activeMRR = 0;
  let trialingMRR = 0;

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    let subMRR = 0;
    for (const item of sub.items.data) {
      const price = item.price;
      if (!price.unit_amount) continue;
      const amount = price.unit_amount * (item.quantity || 1);

      switch (price.recurring?.interval) {
        case "month":
          subMRR += amount;
          break;
        case "year":
          subMRR += Math.round(amount / 12);
          break;
        case "week":
          subMRR += Math.round(amount * 4.33);
          break;
        case "day":
          subMRR += Math.round(amount * 30);
          break;
        default:
          subMRR += amount;
      }
    }

    if (sub.status === "active") {
      activeMRR += subMRR;
    } else {
      trialingMRR += subMRR;
    }
  }

  return { activeMRR, trialingMRR };
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
  warnings: string[];
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
    ...scanStuckSubscriptions(data.subscriptions),
    ...scanLegacyPricing(data.subscriptions, data.prices, data.products),
    ...scanMissingPaymentMethods(data.subscriptions, data.paymentMethods),
  ];

  // Step 3b: Build emailMap from available customer data
  const emailMap = new Map<string, string>();
  const scanWarnings: string[] = [];

  if (data.hasCustomerAccess) {
    // Full access: get emails from expanded customer objects
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
  } else {
    // Fallback: get emails from invoice.customer_email (no Customers permission needed)
    for (const inv of data.invoices) {
      if (inv.customer_email) {
        const custId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (custId && !emailMap.has(custId)) {
          emailMap.set(custId, inv.customer_email);
        }
      }
    }
    scanWarnings.push(
      "Customers read access was not enabled on this API key. Some customer emails may be missing from the report. Enable Customers read access for full results."
    );
  }

  onProgress?.({ step: "Building report...", progress: 90 });

  // Step 4: Sort leaks by severity (critical first)
  allLeaks.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  // Step 5: Calculate metrics (weighted by recovery rates)
  const { activeMRR, trialingMRR } = calculateMRR(data.subscriptions);
  const rawMrrAtRisk = allLeaks.reduce((sum, l) => sum + l.monthlyImpact, 0);
  const mrrAtRisk = allLeaks.reduce(
    (sum, l) => sum + Math.round(l.monthlyImpact * l.recoveryRate),
    0
  );
  const recoveryPotential = allLeaks.reduce(
    (sum, l) => sum + Math.round(l.annualImpact * l.recoveryRate),
    0
  );
  const healthScore = calculateHealthScore(allLeaks, activeMRR);

  // Step 6: Build category summaries
  const categories = buildCategorySummaries(allLeaks, rawMrrAtRisk);

  // Step 7: Build final report
  const report: ScanReport = {
    id: generateReportId(),
    scannedAt: new Date().toISOString(),
    summary: {
      mrrAtRisk,
      rawMrrAtRisk,
      leaksFound: allLeaks.length,
      recoveryPotential,
      totalSubscriptions: data.subscriptions.length,
      totalCustomers: countUniqueCustomers(data.subscriptions),
      totalMRR: activeMRR,
      trialingMRR,
      healthScore,
    },
    categories,
    leaks: allLeaks,
  };

  onProgress?.({ step: "Scan complete!", progress: 100 });

  return { report, emailMap, warnings: scanWarnings };
}
