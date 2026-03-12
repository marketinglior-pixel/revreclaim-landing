import type { Leak } from "../types";
import type { ContactSignals, EnrichmentResult } from "./types";
import { fetchContactSignals } from "./hubspot-client";
import { enrichLeak } from "./enrich";

// ============================================================
// Enrichment Orchestrator
//
// Coordinates: extract emails → fetch HubSpot contacts → enrich leaks.
// Called after scanners complete, before report building.
// ============================================================

/** Max time the entire enrichment process is allowed to take (ms) */
const ENRICHMENT_TIMEOUT_MS = 12_000;

/**
 * Enrich leaks with CRM data from HubSpot.
 *
 * @param leaks - The raw Leak[] produced by scanners
 * @param emailMap - Map<customerId, realEmail> from the scan process
 * @param hubspotToken - Decrypted HubSpot Private App token
 * @param portalId - HubSpot portal ID (for contact URL construction)
 * @returns EnrichmentResult with stats and any non-fatal errors
 */
export async function enrichLeaks(
  leaks: Leak[],
  emailMap: Map<string, string>,
  hubspotToken: string,
  portalId: string | null
): Promise<EnrichmentResult> {
  const errors: string[] = [];
  let enrichedCount = 0;
  let matchedContacts = 0;

  // 1. Collect unique emails from leaks (only enrich customers with leaks)
  const leakCustomerIds = new Set(leaks.map((l) => l.customerId));
  const emailsToLookup: string[] = [];
  const customerIdToEmail = new Map<string, string>();

  for (const customerId of leakCustomerIds) {
    const email = emailMap.get(customerId);
    if (email) {
      emailsToLookup.push(email);
      customerIdToEmail.set(customerId, email.toLowerCase().trim());
    }
  }

  if (emailsToLookup.length === 0) {
    return {
      leaks,
      enrichedCount: 0,
      matchedContacts: 0,
      totalEmailsLookedUp: 0,
      errors: ["No customer emails available for CRM lookup."],
    };
  }

  // 2. Fetch contact signals from HubSpot (with timeout)
  let signalsMap: Map<string, ContactSignals>;

  try {
    signalsMap = await withTimeout(
      fetchContactSignals(hubspotToken, emailsToLookup, portalId),
      ENRICHMENT_TIMEOUT_MS
    );
    matchedContacts = signalsMap.size;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[enrichment] HubSpot fetch failed:", msg);
    return {
      leaks,
      enrichedCount: 0,
      matchedContacts: 0,
      totalEmailsLookedUp: emailsToLookup.length,
      errors: [`HubSpot data fetch failed: ${msg}`],
    };
  }

  // 3. Enrich each leak with its customer's CRM signals
  for (const leak of leaks) {
    const email = customerIdToEmail.get(leak.customerId);
    if (!email) continue;

    const signals = signalsMap.get(email);

    if (signals) {
      // Found in CRM → enrich with real signals
      enrichLeak(leak, signals, "hubspot");
      enrichedCount++;
    } else {
      // Not found in CRM → annotate as not found (no adjustment)
      const notFound: ContactSignals = {
        found: false,
        daysSinceLastActivity: null,
        lifecycleStage: null,
        leadStatus: null,
        dealCount: 0,
        tenureDays: null,
        engagementLevel: "unknown",
        hubspotUrl: null,
      };
      enrichLeak(leak, notFound, "hubspot");
    }
  }

  return {
    leaks,
    enrichedCount,
    matchedContacts,
    totalEmailsLookedUp: emailsToLookup.length,
    errors,
  };
}

// Re-export types and client for convenience
export { validateHubSpotToken } from "./hubspot-client";
export type {
  ContactSignals,
  LeakEnrichment,
  EnrichmentProvider,
  EnrichmentConfig,
  EnrichmentResult,
} from "./types";

// ── Helpers ─────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Enrichment timed out after ${ms}ms`)),
      ms
    );
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
