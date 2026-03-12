import type { LeakSeverity } from "../types";

// ============================================================
// CRM Enrichment Types
// ============================================================

export type EnrichmentProvider = "hubspot";

/**
 * Behavioral signals extracted from a CRM contact.
 * These are aggregated/derived — no raw PII is stored.
 */
export interface ContactSignals {
  /** Whether a matching CRM contact was found */
  found: boolean;

  /** Days since last CRM activity (email, call, meeting, note) */
  daysSinceLastActivity: number | null;

  /** HubSpot lifecycle stage (e.g. "customer", "lead", "evangelist") */
  lifecycleStage: string | null;

  /** HubSpot lead status */
  leadStatus: string | null;

  /** Number of associated deals */
  dealCount: number;

  /** Days since contact was created in CRM (tenure) */
  tenureDays: number | null;

  /** Composite engagement level derived from signals */
  engagementLevel: "active" | "cooling" | "inactive" | "unknown";

  /** HubSpot contact URL for quick access */
  hubspotUrl: string | null;
}

/**
 * Enrichment result attached to a single Leak.
 * Describes what changed and why.
 */
export interface LeakEnrichment {
  /** The original severity before enrichment */
  originalSeverity: LeakSeverity;

  /** The original recovery rate before enrichment */
  originalRecoveryRate: number;

  /** Whether severity was adjusted */
  severityAdjusted: boolean;

  /** Whether recovery rate was adjusted */
  recoveryRateAdjusted: boolean;

  /** Human-readable reason for the adjustment */
  adjustmentReason: string | null;

  /** The CRM signals that drove the adjustment */
  signals: ContactSignals;

  /** Which enrichment provider supplied the data */
  provider: EnrichmentProvider;
}

/**
 * Configuration for an enrichment provider connection.
 */
export interface EnrichmentConfig {
  provider: EnrichmentProvider;
  /** Whether enrichment is enabled (user can toggle off without deleting token) */
  enabled: boolean;
  /** When the token was last validated */
  lastValidatedAt: string | null;
  /** Portal ID for HubSpot URL construction */
  portalId: string | null;
}

/**
 * Result of the enrichment orchestrator.
 */
export interface EnrichmentResult {
  /** The enriched leaks (same objects, mutated) */
  leaks: import("../types").Leak[];
  /** How many leaks were successfully enriched */
  enrichedCount: number;
  /** How many unique customers were found in CRM */
  matchedContacts: number;
  /** Total unique customer emails looked up */
  totalEmailsLookedUp: number;
  /** Non-fatal errors during enrichment */
  errors: string[];
}
