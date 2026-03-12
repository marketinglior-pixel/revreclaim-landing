import type { ContactSignals } from "./types";

// ============================================================
// HubSpot CRM Client — Private App Token Auth
// ============================================================

const HUBSPOT_API_BASE = "https://api.hubapi.com";

/** Max contacts per batch read request (HubSpot limit) */
const BATCH_SIZE = 100;

/** Max total emails to look up per enrichment run */
const MAX_EMAILS = 500;

/** Timeout per HubSpot request in ms */
const REQUEST_TIMEOUT_MS = 8000;

/** Delay between batch requests to respect rate limits (10 req/sec) */
const BATCH_DELAY_MS = 120;

/** HubSpot properties to fetch for enrichment */
const CONTACT_PROPERTIES = [
  "hs_lead_status",
  "lifecyclestage",
  "notes_last_updated",
  "hs_last_sales_activity_date",
  "num_associated_deals",
  "createdate",
];

// ── Validation ──────────────────────────────────────────────

/**
 * Validate a HubSpot Private App token by making a test API call.
 * Returns the portal ID on success.
 */
export async function validateHubSpotToken(
  token: string
): Promise<{ valid: boolean; portalId?: string; error?: string }> {
  try {
    // GET account info to validate token + get portal ID
    const res = await fetchWithTimeout(
      `${HUBSPOT_API_BASE}/account-info/v3/details`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.status === 401 || res.status === 403) {
      return { valid: false, error: "Invalid or expired HubSpot token." };
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        valid: false,
        error: `HubSpot API returned ${res.status}: ${body.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as { portalId?: number };
    return {
      valid: true,
      portalId: data.portalId?.toString() ?? undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("AbortError") || msg.includes("timeout")) {
      return { valid: false, error: "HubSpot API timed out. Try again." };
    }
    return { valid: false, error: `Connection failed: ${msg}` };
  }
}

// ── Batch Contact Fetch ─────────────────────────────────────

/**
 * Fetch CRM contact signals for a list of customer emails.
 * Uses the HubSpot batch read API (up to 100 contacts per request).
 *
 * @returns Map<email (lowercase), ContactSignals>
 */
export async function fetchContactSignals(
  token: string,
  emails: string[],
  portalId: string | null
): Promise<Map<string, ContactSignals>> {
  const results = new Map<string, ContactSignals>();

  // Deduplicate and normalize emails, cap at MAX_EMAILS
  const uniqueEmails = [
    ...new Set(emails.map((e) => e.toLowerCase().trim()).filter(Boolean)),
  ].slice(0, MAX_EMAILS);

  if (uniqueEmails.length === 0) return results;

  // Split into batches of BATCH_SIZE
  const batches: string[][] = [];
  for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
    batches.push(uniqueEmails.slice(i, i + BATCH_SIZE));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const contacts = await fetchBatch(token, batch);

      for (const contact of contacts) {
        const email = contact.email?.toLowerCase();
        if (!email) continue;

        results.set(email, toContactSignals(contact, portalId));
      }
    } catch (err) {
      // Log but don't throw — partial enrichment is better than none
      console.warn(
        `[enrichment] HubSpot batch ${i + 1}/${batches.length} failed:`,
        err instanceof Error ? err.message : err
      );
    }

    // Rate limit delay between batches (skip after last batch)
    if (i < batches.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return results;
}

// ── Internal Helpers ────────────────────────────────────────

interface HubSpotContactResult {
  email: string | null;
  hubspotId: string | null;
  properties: Record<string, string | null>;
}

/**
 * Fetch a single batch of contacts by email using the batch read API.
 */
async function fetchBatch(
  token: string,
  emails: string[]
): Promise<HubSpotContactResult[]> {
  const body = {
    properties: CONTACT_PROPERTIES,
    idProperty: "email",
    inputs: emails.map((email) => ({ id: email })),
  };

  const res = await fetchWithTimeout(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/batch/read`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error("HubSpot token is invalid or expired");
  }

  if (res.status === 429) {
    throw new Error("HubSpot rate limit exceeded");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HubSpot batch read failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    results?: Array<{
      id: string;
      properties: Record<string, string | null>;
    }>;
  };

  return (data.results ?? []).map((r) => ({
    email: r.properties.email ?? null,
    hubspotId: r.id,
    properties: r.properties,
  }));
}

/**
 * Convert raw HubSpot properties into our aggregated ContactSignals.
 */
function toContactSignals(
  contact: HubSpotContactResult,
  portalId: string | null
): ContactSignals {
  const props = contact.properties;

  // Calculate days since last activity
  const lastActivityStr =
    props.hs_last_sales_activity_date || props.notes_last_updated;
  const lastActivityMs = lastActivityStr ? new Date(lastActivityStr).getTime() : null;
  const daysSinceLastActivity =
    lastActivityMs && !isNaN(lastActivityMs)
      ? Math.floor((Date.now() - lastActivityMs) / 86_400_000)
      : null;

  // Calculate tenure days
  const createdStr = props.createdate;
  const createdMs = createdStr ? new Date(createdStr).getTime() : null;
  const tenureDays =
    createdMs && !isNaN(createdMs)
      ? Math.floor((Date.now() - createdMs) / 86_400_000)
      : null;

  // Deal count
  const dealCount = parseInt(props.num_associated_deals ?? "0", 10) || 0;

  // Derive engagement level
  const engagementLevel = deriveEngagementLevel(daysSinceLastActivity);

  // HubSpot contact URL
  const hubspotUrl =
    portalId && contact.hubspotId
      ? `https://app.hubspot.com/contacts/${portalId}/contact/${contact.hubspotId}`
      : null;

  return {
    found: true,
    daysSinceLastActivity,
    lifecycleStage: props.lifecyclestage || null,
    leadStatus: props.hs_lead_status || null,
    dealCount,
    tenureDays,
    engagementLevel,
    hubspotUrl,
  };
}

/**
 * Derive engagement level from days since last CRM activity.
 */
function deriveEngagementLevel(
  daysSinceLastActivity: number | null
): ContactSignals["engagementLevel"] {
  if (daysSinceLastActivity === null) return "unknown";
  if (daysSinceLastActivity <= 14) return "active";
  if (daysSinceLastActivity <= 45) return "cooling";
  return "inactive";
}

/**
 * Fetch with AbortController timeout.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
