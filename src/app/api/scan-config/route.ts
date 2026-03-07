import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { validateApiKey } from "@/lib/utils";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { canEnableAutoScan } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { trackEvent } from "@/lib/analytics";
import { calculateNextScan } from "@/lib/scan-utils";
import type { Database } from "@/lib/supabase/types";

type ScanConfigUpdate = Database["public"]["Tables"]["scan_configs"]["Update"];

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 config updates per IP per hour
    const ip = getClientIP(req);
    const rl = rateLimit({ name: "scan-config", maxRequests: 10, windowSeconds: 3600 }, ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Plan enforcement: check if user can enable auto-scans
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, is_disabled")
      .eq("id", user.id)
      .single();

    // Kill switch: block disabled users
    if (profile?.is_disabled) {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    const userPlan = ((profile?.plan as string) || "free") as PlanType;
    const autoScanCheck = canEnableAutoScan(userPlan);
    if (!autoScanCheck.allowed) {
      return NextResponse.json(
        { error: autoScanCheck.reason },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { apiKey, platform, frequency, isActive } = body;

    // Validate platform and frequency enums
    const validPlatforms = ["stripe", "polar", "paddle"];
    const validFrequencies = ["daily", "weekly", "monthly"];
    const validPlatform = platform || "stripe";
    const validFrequency = frequency || "weekly";

    if (!validPlatforms.includes(validPlatform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(", ")}` },
        { status: 400 }
      );
    }
    if (!validFrequencies.includes(validFrequency)) {
      return NextResponse.json(
        { error: `Invalid frequency. Must be one of: ${validFrequencies.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if config already exists
    const { data: existing } = await supabase
      .from("scan_configs")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // If providing a new API key, validate and encrypt it
    let encryptedKey: string | undefined;
    if (apiKey) {
      const validation = validateApiKey(apiKey, validPlatform);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      encryptedKey = encrypt(apiKey);
    } else if (!existing) {
      return NextResponse.json(
        { error: "API key is required for initial setup" },
        { status: 400 }
      );
    }

    // Calculate next scan time
    const nextScanAt = calculateNextScan(validFrequency);

    if (existing) {
      // Update existing config
      const updateData: ScanConfigUpdate = {
        scan_frequency: validFrequency as "weekly" | "daily" | "monthly",
        is_active: isActive ?? true,
        next_scan_at: nextScanAt,
      };
      if (encryptedKey) {
        updateData.encrypted_api_key = encryptedKey;
      }

      const { error } = await supabase
        .from("scan_configs")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      return NextResponse.json({
        message: "Auto-scan settings updated successfully.",
      });
    } else {
      // Create new config
      const { error } = await supabase.from("scan_configs").insert({
        user_id: user.id,
        encrypted_api_key: encryptedKey!,
        platform: validPlatform,
        scan_frequency: validFrequency,
        is_active: isActive ?? true,
        next_scan_at: nextScanAt,
      });

      if (error) throw error;

      // Track auto-scan enabled event
      trackEvent("auto_scan_enabled", user.id, { frequency: validFrequency }).catch(() => {});

      return NextResponse.json({
        message: "Auto-scans enabled! Your first automated scan will run soon.",
      });
    }
  } catch (error) {
    console.error("[SCAN-CONFIG ERROR]", error);
    return NextResponse.json(
      { error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await supabase
      .from("scan_configs")
      .select("is_active, next_scan_at, scan_frequency, platform")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json(data || null);
  } catch (error) {
    console.error("[SCAN-CONFIG GET ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load configuration" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
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
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ message: "Configuration deleted." });
  } catch (error) {
    console.error("[SCAN-CONFIG DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}

