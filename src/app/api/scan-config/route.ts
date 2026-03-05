import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { validateApiKey } from "@/lib/utils";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
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

    const body = await req.json();
    const { apiKey, frequency, isActive } = body;

    // Check if config already exists
    const { data: existing } = await supabase
      .from("scan_configs")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // If providing a new API key, validate and encrypt it
    let encryptedKey: string | undefined;
    if (apiKey) {
      const validation = validateApiKey(apiKey);
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
    const nextScanAt = calculateNextScan(frequency || "weekly");

    if (existing) {
      // Update existing config
      const updateData: ScanConfigUpdate = {
        scan_frequency: (frequency || "weekly") as "weekly" | "daily" | "monthly",
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
        scan_frequency: frequency || "weekly",
        is_active: isActive ?? true,
        next_scan_at: nextScanAt,
      });

      if (error) throw error;

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

function calculateNextScan(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      now.setHours(6, 0, 0, 0); // 6 AM UTC
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      now.setHours(6, 0, 0, 0);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      now.setHours(6, 0, 0, 0);
      break;
    default:
      now.setDate(now.getDate() + 7);
      now.setHours(6, 0, 0, 0);
  }
  return now.toISOString();
}
