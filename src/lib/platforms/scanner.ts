// ============================================================
// Multi-Platform Scanner Orchestrator
// Routes to the correct provider, runs applicable scanners
// ============================================================

import { getProvider, ScanProgress } from "./provider";
import { BillingPlatform, PLATFORM_CAPABILITIES } from "./types";
import {
  Leak,
  LeakType,
  LeakCategorySummary,
  ScanReport,
  LEAK_TYPE_LABELS,
  SEVERITY_ORDER,
} from "../types";
import { generateReportId, calculateHealthScore } from "../utils";

// Import v2 scanners
import { scanFailedPayments } from "../scanners-v2/failed-payments";
import { scanGhostSubscriptions } from "../scanners-v2/ghost-subscriptions";
import { scanExpiringCards } from "../scanners-v2/expiring-cards";
import { scanExpiredCoupons } from "../scanners-v2/expired-coupons";
import { scanNeverExpiringDiscounts } from "../scanners-v2/never-expiring-discounts";
import { scanLegacyPricing } from "../scanners-v2/legacy-pricing";
import { scanMissingPaymentMethods } from "../scanners-v2/missing-payment-methods";

/**
 * Run a full scan for any supported billing platform.
 * Fetches normalized data from the provider and runs applicable scanners.
 */
export async function runPlatformScan(
  platform: BillingPlatform,
  apiKey: string,
  onProgress?: (progress: ScanProgress) => void
): Promise<ScanReport> {
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
      console.error(`[SCANNER] ${name} failed for ${platform}:`, err);
    }
  }

  if (caps.failedPayments) {
    runScanner("failedPayments", () => scanFailedPayments(data.invoices));
  }
  if (caps.ghostSubscriptions) {
    runScanner("ghostSubscriptions", () => scanGhostSubscriptions(data.subscriptions));
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

  onProgress?.({ step: "Building report...", progress: 90 });

  // Step 4: Sort leaks by severity (critical first)
  allLeaks.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  // Step 5: Calculate metrics
  const totalMRR = data.subscriptions
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((sum, s) => sum + s.monthlyAmountCents, 0);

  const mrrAtRisk = allLeaks.reduce((sum, l) => sum + l.monthlyImpact, 0);
  const healthScore = calculateHealthScore(allLeaks, totalMRR);

  // Step 6: Build category summaries
  const categories = buildCategorySummaries(allLeaks, mrrAtRisk);

  // Step 7: Count unique customers
  const uniqueCustomers = new Set(data.subscriptions.map((s) => s.customerId));

  // Step 8: Build final report
  const report: ScanReport = {
    id: generateReportId(),
    platform,
    scannedAt: new Date().toISOString(),
    summary: {
      mrrAtRisk,
      leaksFound: allLeaks.length,
      recoveryPotential: mrrAtRisk * 12,
      totalSubscriptions: data.subscriptions.length,
      totalCustomers: uniqueCustomers.size,
      totalMRR: totalMRR,
      healthScore,
    },
    categories,
    leaks: allLeaks,
  };

  onProgress?.({ step: "Scan complete!", progress: 100 });

  return report;
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
