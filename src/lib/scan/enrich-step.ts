/**
 * Scan Enrichment Step
 *
 * Loads HubSpot config from DB, decrypts token, and runs enrichment.
 * Called after scanners complete, before report is returned.
 *
 * Returns null if enrichment is not configured, not enabled, or fails.
 * This function never throws — all errors are handled internally.
 */

import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { enrichLeaks } from "@/lib/enrichment";
import type { EnrichmentResult } from "@/lib/enrichment";
import type { ScanReport } from "@/lib/types";
import { createLogger } from "@/lib/logger";

const log = createLogger("ENRICH_STEP");

/**
 * Attempt to enrich leaks with CRM data.
 *
 * @param userId - Authenticated user ID
 * @param report - The scan report with leaks to enrich
 * @param emailMap - Map<customerId, email> from the scan process
 * @returns EnrichmentResult if enrichment ran, null if skipped
 */
export async function tryEnrichLeaks(
  userId: string,
  report: ScanReport,
  emailMap: Map<string, string>
): Promise<EnrichmentResult | null> {
  try {
    // 1. Load HubSpot config from scan_configs
    const supabase = await createClient();
    const { data: config } = await supabase
      .from("scan_configs")
      .select(
        "hubspot_enabled, hubspot_token_encrypted, hubspot_portal_id"
      )
      .eq("user_id", userId)
      .single();

    // Not configured or not enabled → skip
    if (!config?.hubspot_enabled || !config.hubspot_token_encrypted) {
      return null;
    }

    // 2. Decrypt token
    let hubspotToken: string;
    try {
      hubspotToken = decrypt(config.hubspot_token_encrypted);
    } catch (err) {
      log.error("Failed to decrypt HubSpot token:", err);
      return null;
    }

    // 3. Run enrichment
    const result = await enrichLeaks(
      report.leaks,
      emailMap,
      hubspotToken,
      config.hubspot_portal_id
    );

    // Log non-fatal errors from enrichment
    if (result.errors.length > 0) {
      log.warn("Enrichment warnings:", result.errors.join("; "));
    }

    return result;
  } catch (err) {
    log.error(
      "Enrichment step failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
