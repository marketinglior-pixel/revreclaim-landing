// ============================================================
// Stripe Provider — wraps existing stripe-scanner.ts
// Delegates to the existing runFullScan for backward compat
// ============================================================

import { BillingProvider, ScanProgress } from "./provider";
import { NormalizedBillingData } from "./types";
import { runFullScan } from "../stripe-scanner";
import { ScanReport } from "../types";

// For the Stripe provider, we use a hybrid approach:
// - runFullScan() uses the existing V1 scanners (proven, tested)
// - The normalized data path is available but not primary yet
// The runPlatformScan orchestrator won't call fetchNormalizedData for Stripe;
// instead, the scan API route dispatches directly to runFullScan.

export const stripeProvider: BillingProvider = {
  platform: "stripe",

  validateKeyFormat(apiKey: string) {
    if (!/^rk_(live|test)_[A-Za-z0-9]+$/.test(apiKey)) {
      return {
        valid: false,
        error:
          "Must be a Stripe restricted key (starts with rk_live_ or rk_test_)",
      };
    }
    return { valid: true };
  },

  async validateConnection(apiKey: string) {
    // The existing runFullScan handles validation internally
    // This is a lightweight check — the full validation happens in runFullScan
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(apiKey, {
      apiVersion: "2026-02-25.clover",
    });
    await stripe.balance.retrieve();
  },

  isTestMode(apiKey: string) {
    return apiKey.startsWith("rk_test_");
  },

  async fetchNormalizedData(
    _apiKey: string,
    _onProgress?: (progress: ScanProgress) => void
  ): Promise<NormalizedBillingData> {
    // For Stripe, we bypass normalized data and use runFullScan directly
    // This method exists to satisfy the interface but won't be called
    // for the initial implementation
    throw new Error(
      "Stripe uses the legacy scan path. Call runStripeScan() directly instead of runPlatformScan(). The scan API route and cron jobs handle this dispatch automatically."
    );
  },
};

/**
 * Run a Stripe scan using the existing proven V1 path.
 * Returns a ScanReport with platform field set.
 */
export async function runStripeScan(
  apiKey: string,
  onProgress?: (progress: ScanProgress) => void
): Promise<ScanReport> {
  const { report } = await runFullScan(apiKey, onProgress);
  // Add platform field and set platformUrl aliases
  report.platform = "stripe";
  for (const leak of report.leaks) {
    if (leak.stripeUrl && !leak.platformUrl) {
      leak.platformUrl = leak.stripeUrl;
    }
  }
  return report;
}
