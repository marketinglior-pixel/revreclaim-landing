// ============================================================
// Multi-Platform Scanner Orchestrator
// Routes to the correct provider, runs applicable scanners
// ============================================================

import { getProvider, ScanProgress } from "./provider";
import { BillingPlatform, PLATFORM_CAPABILITIES } from "./types";
import { createLogger } from "@/lib/logger";

const log = createLogger("SCANNER");
import {
  Leak,
  LeakType,
  LeakCategorySummary,
  ScanReport,
  ScanMetadata,
  LEAK_TYPE_LABELS,
  SEVERITY_ORDER,
} from "../types";
import { generateReportId, calculateHealthScore } from "../utils";
import { buildEmailMap } from "../recovery/action-generator";
import { computeBillingHealth } from "../billing-health";

export interface PlatformScanResult {
  report: ScanReport;
  emailMap: Map<string, string>;
}

// Import v2 scanners
import { scanFailedPayments } from "../scanners-v2/failed-payments";
import { scanStuckSubscriptions } from "../scanners-v2/stuck-subscriptions";
import { scanExpiringCards } from "../scanners-v2/expiring-cards";
import { scanExpiredCoupons } from "../scanners-v2/expired-coupons";
import { scanNeverExpiringDiscounts } from "../scanners-v2/never-expiring-discounts";
import { scanLegacyPricing } from "../scanners-v2/legacy-pricing";
import { scanMissingPaymentMethods } from "../scanners-v2/missing-payment-methods";
import { scanUnbilledOverages } from "../scanners-v2/unbilled-overages";
import { scanTrialExpired } from "../scanners-v2/trial-expired";
import { scanDuplicateSubscriptions } from "../scanners-v2/duplicate-subscriptions";

/**
 * Run a full scan for any supported billing platform.
 * Fetches normalized data from the provider and runs applicable scanners.
 */
export async function runPlatformScan(
  platform: BillingPlatform,
  apiKey: string,
  onProgress?: (progress: ScanProgress) => void
): Promise<PlatformScanResult> {
  const provider = getProvider(platform);
  const caps = PLATFORM_CAPABILITIES[platform];

  // Step 1: Validate
  onProgress?.({ step: "Validating API key...", progress: 5 });
  await provider.validateConnection(apiKey);

  // Step 2: Fetch normalized data
  const data = await provider.fetchNormalizedData(apiKey, onProgress);

  // Step 3: Run applicable scanners
  onProgress?.({ step: "Analyzing subscriptions...", progress: 70 });

  const allLeaks: Leak[] = [];

  // Run each scanner in isolation — one failure won't kill the whole scan
  function runScanner(name: string, fn: () => Leak[]) {
    try {
      allLeaks.push(...fn());
    } catch (err) {
      log.error(`${name} failed for ${platform}:`, err);
    }
  }

  if (caps.failedPayments) {
    runScanner("failedPayments", () => scanFailedPayments(data.invoices, data.subscriptions));
  }
  if (caps.stuckSubscriptions) {
    runScanner("stuckSubscriptions", () => scanStuckSubscriptions(data.subscriptions));
  }
  if (caps.expiringCards) {
    runScanner("expiringCards", () => scanExpiringCards(data.subscriptions, data.paymentMethods));
  }
  if (caps.expiredCoupons) {
    runScanner("expiredCoupons", () => scanExpiredCoupons(data.subscriptions));
  }
  if (caps.neverExpiringDiscounts) {
    runScanner("neverExpiringDiscounts", () => scanNeverExpiringDiscounts(data.subscriptions));
  }
  if (caps.legacyPricing) {
    runScanner("legacyPricing", () => scanLegacyPricing(data.subscriptions, data.prices, data.products));
  }
  if (caps.missingPaymentMethods) {
    runScanner("missingPaymentMethods", () => scanMissingPaymentMethods(data.subscriptions, data.paymentMethods));
  }
  if (caps.unbilledOverages) {
    runScanner("unbilledOverages", () => scanUnbilledOverages(data.subscriptions, data.invoices));
  }
  if (caps.trialExpired) {
    runScanner("trialExpired", () => scanTrialExpired(data.subscriptions));
  }
  if (caps.duplicateSubscriptions) {
    runScanner("duplicateSubscriptions", () => scanDuplicateSubscriptions(data.subscriptions));
  }

  onProgress?.({ step: "Building report...", progress: 90 });

  // Step 4: Sort leaks by severity (critical first)
  allLeaks.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  // Step 5: Calculate metrics
  // Only count active subscriptions in MRR (trialing = $0 revenue)
  const totalMRR = data.subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.monthlyAmountCents, 0);

  // Track trialing MRR separately for display
  const trialingMRR = data.subscriptions
    .filter((s) => s.status === "trialing")
    .reduce((sum, s) => sum + s.monthlyAmountCents, 0);

  // Step 5b: Deduplicate MRR-at-risk by subscriptionId
  // The same subscription can appear in multiple scanners (e.g., expiring card +
  // missing payment method + stuck subscription). For totals, only count the
  // highest-impact leak per subscription to avoid inflating the numbers.
  // Leaks without a subscriptionId (e.g., invoice-level) are always counted.
  const subMaxImpact = new Map<string, { raw: number; weighted: number }>();
  let rawMrrAtRisk = 0;
  let mrrAtRisk = 0;

  for (const leak of allLeaks) {
    const weighted = Math.round(leak.monthlyImpact * (leak.recoveryRate ?? 1));

    if (!leak.subscriptionId) {
      // No subscription ID (invoice-level leaks) — always count
      rawMrrAtRisk += leak.monthlyImpact;
      mrrAtRisk += weighted;
    } else {
      // Track the max impact per subscription (don't sum duplicates)
      const existing = subMaxImpact.get(leak.subscriptionId);
      if (!existing || leak.monthlyImpact > existing.raw) {
        subMaxImpact.set(leak.subscriptionId, { raw: leak.monthlyImpact, weighted });
      }
    }
  }

  // Add the deduplicated subscription impacts
  for (const { raw, weighted } of subMaxImpact.values()) {
    rawMrrAtRisk += raw;
    mrrAtRisk += weighted;
  }

  const healthScore = calculateHealthScore(allLeaks, totalMRR, rawMrrAtRisk);

  // Step 6: Build category summaries (uses individual leak data, not deduped)
  const categories = buildCategorySummaries(allLeaks, mrrAtRisk);

  // Step 7: Count unique customers
  const uniqueCustomers = new Set(data.subscriptions.map((s) => s.customerId));

  // Step 8: Build summary — recovery potential also uses deduped amounts
  // For recovery potential: sum annualImpact per subscription (max only), not across all leaks
  const subMaxAnnual = new Map<string, number>();
  let recoveryPotential = 0;

  for (const leak of allLeaks) {
    const weightedAnnual = Math.round(leak.annualImpact * (leak.recoveryRate ?? 1));

    if (!leak.subscriptionId) {
      recoveryPotential += weightedAnnual;
    } else {
      const existing = subMaxAnnual.get(leak.subscriptionId) ?? 0;
      if (weightedAnnual > existing) {
        subMaxAnnual.set(leak.subscriptionId, weightedAnnual);
      }
    }
  }

  for (const annual of subMaxAnnual.values()) {
    recoveryPotential += annual;
  }

  const summary = {
    mrrAtRisk,
    rawMrrAtRisk,
    trialingMRR,
    leaksFound: allLeaks.length,
    recoveryPotential,
    totalSubscriptions: data.subscriptions.length,
    totalCustomers: uniqueCustomers.size,
    totalMRR: totalMRR,
    healthScore,
  };

  // Step 9: Compute billing health insights
  const billingHealth = computeBillingHealth(summary, categories, allLeaks);

  // Step 10: Compute scan metadata for benchmark dataset
  const uniquePriceIds = new Set(
    data.subscriptions.flatMap((s) => s.items?.map((i) => i.priceId) ?? [])
  );
  const activeSubs = data.subscriptions.filter((s) => s.status === "active");
  const avgDealSizeCents =
    activeSubs.length > 0
      ? Math.round(activeSubs.reduce((s, sub) => s + sub.monthlyAmountCents, 0) / activeSubs.length)
      : 0;
  // Infer billing model: self-serve (<$500 avg), sales-led (>$2000 avg), mixed in between
  const billingModel: ScanMetadata["billingModel"] =
    avgDealSizeCents === 0
      ? "unknown"
      : avgDealSizeCents < 50000
        ? "self_serve"
        : avgDealSizeCents > 200000
          ? "sales_led"
          : "mixed";

  // Check dunning: if there are failed payments with no retries, dunning is likely not configured
  const hasFailedPaymentLeaks = allLeaks.some((l) => l.type === "failed_payment");
  const hasDunningSetup = !hasFailedPaymentLeaks; // rough heuristic

  const scanMetadata: ScanMetadata = {
    numberOfPlans: uniquePriceIds.size,
    hasDunningSetup,
    billingModel,
    avgDealSizeCents,
  };

  // Step 11: Build final report
  const report: ScanReport = {
    id: generateReportId(),
    platform,
    scannedAt: new Date().toISOString(),
    summary,
    categories,
    leaks: allLeaks,
    billingHealth,
    scanMetadata,
  };

  onProgress?.({ step: "Scan complete!", progress: 100 });

  // Build email map for recovery actions (real, unmasked emails)
  const emailMap = buildEmailMap(data);

  return { report, emailMap };
}

function buildCategorySummaries(
  leaks: Leak[],
  totalMrrAtRisk: number
): LeakCategorySummary[] {
  const categoryMap = new Map<LeakType, { count: number; impact: number }>();

  for (const leak of leaks) {
    const existing = categoryMap.get(leak.type) || { count: 0, impact: 0 };
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

  categories.sort((a, b) => b.totalMonthlyImpact - a.totalMonthlyImpact);
  return categories;
}
