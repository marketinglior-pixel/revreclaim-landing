// ============================================================
// Platform Registry — registers all providers on import
// ============================================================

import { registerProvider, getProvider, getAllProviders, isRegisteredPlatform } from "./provider";
import { stripeProvider } from "./stripe-provider";
import { polarProvider } from "./polar-provider";
import { paddleProvider } from "./paddle-provider";
import { lemonSqueezyProvider } from "./lemonsqueezy-provider";

// Register all providers
registerProvider(stripeProvider);
registerProvider(polarProvider);
registerProvider(paddleProvider);
registerProvider(lemonSqueezyProvider);

// Re-exports
export { getProvider, getAllProviders, isRegisteredPlatform };
export type { BillingProvider, ScanProgress } from "./provider";
export * from "./types";
export { runPlatformScan } from "./scanner";
export { runStripeScan } from "./stripe-provider";
