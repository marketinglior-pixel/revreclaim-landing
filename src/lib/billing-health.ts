// ============================================================
// Billing Health Insights Calculator
// Computes aggregate health dimensions from scan results
// ============================================================

import {
  Leak,
  ScanSummary,
  LeakCategorySummary,
  BillingHealthInsight,
  BillingHealthInsights,
} from "./types";

/**
 * Compute billing health insights from scan results.
 * Each insight scores a different dimension of billing health (0-100).
 */
export function computeBillingHealth(
  summary: ScanSummary,
  categories: LeakCategorySummary[],
  leaks: Leak[]
): BillingHealthInsights {
  const baseInsights: BillingHealthInsight[] = [
    computePaymentHealth(summary, categories, leaks),
    computeDiscountHygiene(summary, categories, leaks),
    computePriceFreshness(summary, categories, leaks),
    computeSubscriptionIntegrity(summary, categories, leaks),
    computeChurnRisk(summary, categories, leaks),
    computeRevenueCapture(summary, categories, leaks),
  ];

  // 7th dimension: Customer Engagement — only when CRM enrichment data is present
  const enrichedLeaks = leaks.filter((l) => l.enrichment?.signals?.found);
  if (enrichedLeaks.length > 0) {
    baseInsights.push(computeCustomerEngagement(summary, enrichedLeaks));
  }

  const insights = baseInsights;

  const overallGrade = computeGrade(insights);

  return { insights, overallGrade };
}

// ── Payment Health ──────────────────────────────────────────

function computePaymentHealth(
  summary: ScanSummary,
  categories: LeakCategorySummary[],
  leaks: Leak[]
): BillingHealthInsight {
  const failedPayments = leaks.filter((l) => l.type === "failed_payment");
  const expiringCards = leaks.filter((l) => l.type === "expiring_card");
  const missingMethods = leaks.filter((l) => l.type === "missing_payment_method");

  const totalIssues = failedPayments.length + expiringCards.length + missingMethods.length;
  const totalAtRisk = [...failedPayments, ...expiringCards, ...missingMethods].reduce(
    (sum, l) => sum + l.monthlyImpact,
    0
  );

  // Score: 100 if no issues, deduct per issue proportional to MRR impact
  let score = 100;
  if (summary.totalMRR > 0) {
    const riskPct = totalAtRisk / summary.totalMRR;
    score -= Math.min(60, riskPct * 100 * 10);
  }
  score -= Math.min(30, failedPayments.length * 8);
  score -= Math.min(10, expiringCards.length * 2);
  score = Math.max(0, Math.round(score));

  let detail: string;
  if (totalIssues === 0) {
    detail = "No payment issues detected. All cards valid and payments current.";
  } else {
    const parts: string[] = [];
    if (failedPayments.length > 0) parts.push(`${failedPayments.length} failed payment${failedPayments.length !== 1 ? "s" : ""}`);
    if (expiringCards.length > 0) parts.push(`${expiringCards.length} expiring card${expiringCards.length !== 1 ? "s" : ""}`);
    if (missingMethods.length > 0) parts.push(`${missingMethods.length} missing method${missingMethods.length !== 1 ? "s" : ""}`);
    detail = `${parts.join(", ")}. ${formatCents(totalAtRisk)}/mo at risk.`;
  }

  return {
    id: "payment_health",
    label: "Payment Health",
    description: "Failed payments, expiring cards, and missing payment methods",
    score,
    status: getStatus(score),
    detail,
  };
}

// ── Discount Hygiene ────────────────────────────────────────

function computeDiscountHygiene(
  summary: ScanSummary,
  _categories: LeakCategorySummary[],
  leaks: Leak[]
): BillingHealthInsight {
  const expiredCoupons = leaks.filter((l) => l.type === "expired_coupon");
  const foreverDiscounts = leaks.filter((l) => l.type === "never_expiring_discount");

  const totalIssues = expiredCoupons.length + foreverDiscounts.length;
  const discountLeakage = [...expiredCoupons, ...foreverDiscounts].reduce(
    (sum, l) => sum + l.monthlyImpact,
    0
  );

  let score = 100;
  if (summary.totalMRR > 0) {
    const leakPct = discountLeakage / summary.totalMRR;
    score -= Math.min(50, leakPct * 100 * 12);
  }
  score -= Math.min(30, expiredCoupons.length * 10);
  score -= Math.min(20, foreverDiscounts.length * 10);
  score = Math.max(0, Math.round(score));

  let detail: string;
  if (totalIssues === 0) {
    detail = "All discounts are properly configured. No expired or runaway coupons found.";
  } else {
    const parts: string[] = [];
    if (expiredCoupons.length > 0) parts.push(`${expiredCoupons.length} expired coupon${expiredCoupons.length !== 1 ? "s" : ""} still active`);
    if (foreverDiscounts.length > 0) parts.push(`${foreverDiscounts.length} forever discount${foreverDiscounts.length !== 1 ? "s" : ""}`);
    detail = `${parts.join(", ")}. Leaking ${formatCents(discountLeakage)}/mo.`;
  }

  return {
    id: "discount_hygiene",
    label: "Discount Hygiene",
    description: "Expired coupons, forever discounts, and discount concentration",
    score,
    status: getStatus(score),
    detail,
  };
}

// ── Price Freshness ─────────────────────────────────────────

function computePriceFreshness(
  summary: ScanSummary,
  _categories: LeakCategorySummary[],
  leaks: Leak[]
): BillingHealthInsight {
  const legacyPricing = leaks.filter((l) => l.type === "legacy_pricing");
  const legacyImpact = legacyPricing.reduce((sum, l) => sum + l.monthlyImpact, 0);

  let score = 100;
  if (summary.totalMRR > 0) {
    const lagPct = legacyImpact / summary.totalMRR;
    score -= Math.min(60, lagPct * 100 * 15);
  }
  score -= Math.min(40, legacyPricing.length * 15);
  score = Math.max(0, Math.round(score));

  let detail: string;
  if (legacyPricing.length === 0) {
    detail = "All customers on current pricing. No legacy plan migrations needed.";
  } else {
    const pctOfCustomers = summary.totalCustomers > 0
      ? Math.round((legacyPricing.length / summary.totalCustomers) * 100)
      : 0;
    detail = `${legacyPricing.length} customer${legacyPricing.length !== 1 ? "s" : ""} (${pctOfCustomers}%) on old pricing. ${formatCents(legacyImpact)}/mo gap vs current rates.`;
  }

  return {
    id: "price_freshness",
    label: "Price Freshness",
    description: "Customers still on legacy or outdated pricing tiers",
    score,
    status: getStatus(score),
    detail,
  };
}

// ── Subscription Integrity ──────────────────────────────────

function computeSubscriptionIntegrity(
  summary: ScanSummary,
  _categories: LeakCategorySummary[],
  leaks: Leak[]
): BillingHealthInsight {
  const ghosts = leaks.filter((l) => l.type === "ghost_subscription");
  const duplicates = leaks.filter((l) => l.type === "duplicate_subscription");
  const trialExpired = leaks.filter((l) => l.type === "trial_expired");

  const totalIssues = ghosts.length + duplicates.length + trialExpired.length;
  const totalImpact = [...ghosts, ...duplicates, ...trialExpired].reduce(
    (sum, l) => sum + l.monthlyImpact,
    0
  );

  let score = 100;
  score -= Math.min(30, ghosts.length * 8);
  score -= Math.min(30, duplicates.length * 15); // duplicates are more severe (chargeback risk)
  score -= Math.min(20, trialExpired.length * 10);
  if (summary.totalSubscriptions > 0) {
    const issuePct = totalIssues / summary.totalSubscriptions;
    score -= Math.min(20, issuePct * 100 * 5);
  }
  score = Math.max(0, Math.round(score));

  let detail: string;
  if (totalIssues === 0) {
    detail = "All subscriptions are clean. No ghosts, duplicates, or stuck trials.";
  } else {
    const parts: string[] = [];
    if (ghosts.length > 0) parts.push(`${ghosts.length} ghost sub${ghosts.length !== 1 ? "s" : ""}`);
    if (duplicates.length > 0) parts.push(`${duplicates.length} duplicate${duplicates.length !== 1 ? "s" : ""}`);
    if (trialExpired.length > 0) parts.push(`${trialExpired.length} stuck trial${trialExpired.length !== 1 ? "s" : ""}`);
    detail = `${parts.join(", ")}. ${formatCents(totalImpact)}/mo affected.`;
  }

  return {
    id: "subscription_integrity",
    label: "Subscription Integrity",
    description: "Ghost subscriptions, duplicates, and trials stuck in limbo",
    score,
    status: getStatus(score),
    detail,
  };
}

// ── Churn Risk ──────────────────────────────────────────────

function computeChurnRisk(
  summary: ScanSummary,
  _categories: LeakCategorySummary[],
  leaks: Leak[]
): BillingHealthInsight {
  // Churn risk = expiring cards + failed payments + ghost subs + missing payment methods
  const churnRelated = leaks.filter((l) =>
    ["expiring_card", "failed_payment", "ghost_subscription", "missing_payment_method"].includes(l.type)
  );

  const atRiskMRR = churnRelated.reduce((sum, l) => sum + l.monthlyImpact, 0);
  const criticalCount = churnRelated.filter((l) => l.severity === "critical").length;

  let score = 100;
  if (summary.totalMRR > 0) {
    const riskPct = atRiskMRR / summary.totalMRR;
    score -= Math.min(50, riskPct * 100 * 8);
  }
  score -= Math.min(30, criticalCount * 10);
  score -= Math.min(20, churnRelated.length * 3);
  score = Math.max(0, Math.round(score));

  let detail: string;
  if (churnRelated.length === 0) {
    detail = "Low churn risk. No payment failures or at-risk subscriptions detected.";
  } else {
    const riskPct = summary.totalMRR > 0
      ? ((atRiskMRR / summary.totalMRR) * 100).toFixed(1)
      : "0";
    detail = `${churnRelated.length} subscription${churnRelated.length !== 1 ? "s" : ""} at risk (${riskPct}% of MRR). ${criticalCount > 0 ? `${criticalCount} critical.` : ""}`;
  }

  return {
    id: "churn_risk",
    label: "Churn Risk",
    description: "Involuntary churn signals from payment and subscription issues",
    score,
    status: getStatus(score),
    detail,
  };
}

// ── Revenue Capture ─────────────────────────────────────────

function computeRevenueCapture(
  summary: ScanSummary,
  _categories: LeakCategorySummary[],
  leaks: Leak[]
): BillingHealthInsight {
  // Revenue capture = unbilled overages + legacy pricing + expired coupons + forever discounts
  const captureRelated = leaks.filter((l) =>
    ["unbilled_overage", "legacy_pricing", "expired_coupon", "never_expiring_discount"].includes(l.type)
  );

  const missedRevenue = captureRelated.reduce((sum, l) => sum + l.monthlyImpact, 0);

  let score = 100;
  if (summary.totalMRR > 0) {
    const missPct = missedRevenue / summary.totalMRR;
    score -= Math.min(60, missPct * 100 * 10);
  }
  score -= Math.min(40, captureRelated.length * 6);
  score = Math.max(0, Math.round(score));

  let detail: string;
  if (captureRelated.length === 0) {
    detail = "Full revenue capture. No undercharging or billing gaps detected.";
  } else {
    const annualMissed = missedRevenue * 12;
    detail = `${formatCents(missedRevenue)}/mo (${formatCents(annualMissed)}/yr) in undercaptured revenue across ${captureRelated.length} issue${captureRelated.length !== 1 ? "s" : ""}.`;
  }

  return {
    id: "revenue_capture",
    label: "Revenue Capture",
    description: "Unbilled usage, underpricing, and uncollected amounts",
    score,
    status: getStatus(score),
    detail,
  };
}

// ── Customer Engagement (7th dimension — CRM enrichment) ────

function computeCustomerEngagement(
  summary: ScanSummary,
  enrichedLeaks: Leak[]
): BillingHealthInsight {
  const totalEnriched = enrichedLeaks.length;
  const activeCount = enrichedLeaks.filter(
    (l) => l.enrichment?.signals?.engagementLevel === "active"
  ).length;
  const coolingCount = enrichedLeaks.filter(
    (l) => l.enrichment?.signals?.engagementLevel === "cooling"
  ).length;
  const inactiveCount = enrichedLeaks.filter(
    (l) => l.enrichment?.signals?.engagementLevel === "inactive"
  ).length;

  // Score based on engagement distribution among leaky customers
  let score = 100;
  if (totalEnriched > 0) {
    const inactivePct = inactiveCount / totalEnriched;
    const coolingPct = coolingCount / totalEnriched;
    score -= Math.min(50, inactivePct * 100);
    score -= Math.min(25, coolingPct * 50);
  }
  // Penalize for high inactive count
  score -= Math.min(25, inactiveCount * 5);
  score = Math.max(0, Math.round(score));

  let detail: string;
  if (inactiveCount === 0 && coolingCount === 0) {
    detail = `All ${totalEnriched} customers with leaks are actively engaged in CRM. High recovery potential.`;
  } else {
    const parts: string[] = [];
    if (activeCount > 0) parts.push(`${activeCount} active`);
    if (coolingCount > 0) parts.push(`${coolingCount} cooling off`);
    if (inactiveCount > 0) parts.push(`${inactiveCount} inactive`);
    detail = `Of ${totalEnriched} enriched customers: ${parts.join(", ")}.${
      inactiveCount > 0 ? " Inactive customers have lower recovery likelihood." : ""
    }`;
  }

  return {
    id: "customer_engagement",
    label: "Customer Engagement",
    description: "CRM engagement levels of customers with billing issues",
    score,
    status: getStatus(score),
    detail,
  };
}

// ── Helpers ─────────────────────────────────────────────────

function getStatus(score: number): "healthy" | "warning" | "danger" {
  if (score >= 75) return "healthy";
  if (score >= 45) return "warning";
  return "danger";
}

function computeGrade(insights: BillingHealthInsight[]): "A" | "B" | "C" | "D" | "F" {
  const avg = insights.reduce((sum, i) => sum + i.score, 0) / insights.length;
  if (avg >= 90) return "A";
  if (avg >= 75) return "B";
  if (avg >= 60) return "C";
  if (avg >= 40) return "D";
  return "F";
}

function formatCents(cents: number): string {
  const dollars = Math.round(cents / 100);
  return `$${dollars.toLocaleString()}`;
}
