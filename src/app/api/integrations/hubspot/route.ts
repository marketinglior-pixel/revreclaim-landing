import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { validateHubSpotToken } from "@/lib/enrichment";
import { canUseIntegrations } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { guardMutation } from "@/lib/api-security";
import { trackEvent } from "@/lib/analytics";
import { fireAndForget } from "@/lib/fire-and-forget";
import { logAudit } from "@/lib/audit-log";
import { createLogger } from "@/lib/logger";

const log = createLogger("HUBSPOT");

// ── POST — Connect HubSpot ─────────────────────────────────

export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    // Rate limit: 10 attempts per IP per hour
    const ip = getClientIP(req);
    const rl = await rateLimit(
      { name: "hubspot-connect", maxRequests: 10, windowSeconds: 3600 },
      ip
    );
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    // Auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Plan check
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, is_disabled")
      .eq("id", user.id)
      .single();

    if (profile?.is_disabled) {
      return NextResponse.json(
        { error: "Your account has been suspended." },
        { status: 403 }
      );
    }

    const userPlan = ((profile?.plan as string) || "free") as PlanType;
    const integrationCheck = canUseIntegrations(userPlan);
    if (!integrationCheck.allowed) {
      return NextResponse.json(
        { error: integrationCheck.reason },
        { status: 403 }
      );
    }

    // Parse body
    const body = await req.json();
    const { token } = body as { token?: string };

    if (!token || typeof token !== "string" || token.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid HubSpot Private App token." },
        { status: 400 }
      );
    }

    // Validate token with HubSpot API
    const validation = await validateHubSpotToken(token.trim());
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid HubSpot token." },
        { status: 400 }
      );
    }

    // Encrypt and store
    const encryptedToken = encrypt(token.trim());
    const portalId = validation.portalId || null;

    // Check if user has a scan_config row
    const { data: existing } = await supabase
      .from("scan_configs")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("scan_configs")
        .update({
          hubspot_token_encrypted: encryptedToken,
          hubspot_portal_id: portalId,
          hubspot_enabled: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      // Edge case: user connecting HubSpot before running their first scan.
      // We can't create a scan_config without an encrypted_api_key (required).
      // Return a helpful message instead.
      return NextResponse.json(
        {
          error:
            "Please run your first scan before connecting HubSpot. Your billing platform API key is needed first.",
        },
        { status: 400 }
      );
    }

    log.info(
      `HubSpot connected for user ${user.id}, portal ${portalId}`
    );

    // Track + audit (non-blocking)
    fireAndForget(
      trackEvent("hubspot_connected", user.id, { portalId }),
      "HUBSPOT_CONNECT_TRACKING"
    );
    fireAndForget(
      logAudit({
        userId: user.id,
        action: "hubspot_connected",
        resource: "integration",
        metadata: { portalId },
      }),
      "HUBSPOT_CONNECT_AUDIT"
    );

    return NextResponse.json({
      message: "HubSpot connected successfully.",
      portalId,
    });
  } catch (error) {
    log.error("Connect error:", error);
    return NextResponse.json(
      { error: "Failed to connect HubSpot." },
      { status: 500 }
    );
  }
}

// ── GET — Connection status ─────────────────────────────────

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: config } = await supabase
      .from("scan_configs")
      .select("hubspot_enabled, hubspot_portal_id, hubspot_token_encrypted")
      .eq("user_id", user.id)
      .single();

    if (!config || !config.hubspot_token_encrypted) {
      return NextResponse.json({
        connected: false,
        enabled: false,
        portalId: null,
      });
    }

    return NextResponse.json({
      connected: true,
      enabled: config.hubspot_enabled,
      portalId: config.hubspot_portal_id,
    });
  } catch (error) {
    log.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to load HubSpot status." },
      { status: 500 }
    );
  }
}

// ── DELETE — Disconnect HubSpot ─────────────────────────────

export async function DELETE(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("scan_configs")
      .update({
        hubspot_token_encrypted: null,
        hubspot_portal_id: null,
        hubspot_enabled: false,
      })
      .eq("user_id", user.id);

    if (error) throw error;

    log.info(`HubSpot disconnected for user ${user.id}`);

    fireAndForget(
      logAudit({
        userId: user.id,
        action: "hubspot_disconnected",
        resource: "integration",
      }),
      "HUBSPOT_DISCONNECT_AUDIT"
    );

    return NextResponse.json({ message: "HubSpot disconnected." });
  } catch (error) {
    log.error("Disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect HubSpot." },
      { status: 500 }
    );
  }
}

// ── PATCH — Toggle enable/disable ───────────────────────────

export async function PATCH(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { enabled } = body as { enabled?: boolean };

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Please provide { enabled: true|false }." },
        { status: 400 }
      );
    }

    // Verify HubSpot is connected before enabling
    if (enabled) {
      const { data: config } = await supabase
        .from("scan_configs")
        .select("hubspot_token_encrypted")
        .eq("user_id", user.id)
        .single();

      if (!config?.hubspot_token_encrypted) {
        return NextResponse.json(
          { error: "Connect HubSpot first before enabling." },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("scan_configs")
      .update({ hubspot_enabled: enabled })
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      message: enabled
        ? "HubSpot enrichment enabled."
        : "HubSpot enrichment disabled.",
      enabled,
    });
  } catch (error) {
    log.error("Toggle error:", error);
    return NextResponse.json(
      { error: "Failed to update HubSpot setting." },
      { status: 500 }
    );
  }
}
