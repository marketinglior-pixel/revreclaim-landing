// ============================================================
// Billing Provider Interface & Registry
// ============================================================

import { BillingPlatform, NormalizedBillingData } from "./types";

export interface ScanProgress {
  step: string;
  progress: number;
}

export interface BillingProvider {
  platform: BillingPlatform;

  /** Validate the API key format (sync, before network call) */
  validateKeyFormat(apiKey: string): { valid: boolean; error?: string };

  /** Validate the API key by making a test request */
  validateConnection(apiKey: string): Promise<void>;

  /** Fetch and normalize all billing data */
  fetchNormalizedData(
    apiKey: string,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<NormalizedBillingData>;

  /** Detect if this is a test/sandbox key */
  isTestMode(apiKey: string): boolean;
}

// --- Provider Registry ---

const providers = new Map<BillingPlatform, BillingProvider>();

export function registerProvider(provider: BillingProvider): void {
  providers.set(provider.platform, provider);
}

export function getProvider(platform: BillingPlatform): BillingProvider {
  const provider = providers.get(platform);
  if (!provider) {
    throw new Error(`No provider registered for platform: ${platform}`);
  }
  return provider;
}

export function getAllProviders(): BillingProvider[] {
  return Array.from(providers.values());
}

export function isRegisteredPlatform(
  platform: string
): platform is BillingPlatform {
  return providers.has(platform as BillingPlatform);
}
