import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { guardMutation } from "@/lib/api-security";

/**
 * GET /api/leaks/dismiss — Fetch user's leak dismissals.
 * Used by the report page to filter out intentionally dismissed leaks.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // leak_dismissals table may not exist in generated types yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data: dismissals, error } = await sb
      .from("leak_dismissals")
      .select("customer_id, product_id, leak_type, reason, created_at")
      .eq("user_id", user.id);

    if (error) {
      // Table might not exist yet — return empty array
      if (error.code === "42P01") {
        return NextResponse.json({ dismissals: [] });
      }
      console.error("[DISMISS] Fetch error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch dismissals" },
        { status: 500 }
      );
    }

    return NextResponse.json({ dismissals: dismissals || [] });
  } catch (err) {
    console.error("[DISMISS] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leaks/dismiss — Mark a leak as intentional.
 * Body: { customerId: string, productId?: string, leakType: string, reason?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const guardResult = guardMutation(req);
    if (guardResult) return guardResult;

    const ip = getClientIP(req);
    const rl = await rateLimit({ name: "dismiss", maxRequests: 30, windowSeconds: 3600 }, ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
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
    const { customerId, productId, leakType, reason } = body;

    if (!customerId || !leakType) {
      return NextResponse.json(
        { error: "customerId and leakType are required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { error } = await sb.from("leak_dismissals").upsert(
      {
        user_id: user.id,
        customer_id: customerId,
        product_id: productId || null,
        leak_type: leakType,
        reason: reason || "intentional",
      },
      { onConflict: "user_id,customer_id,leak_type" }
    );

    if (error) {
      console.error("[DISMISS] Insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to save dismissal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DISMISS] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leaks/dismiss — Undo a dismissal.
 * Body: { customerId: string, leakType: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const guardResult = guardMutation(req);
    if (guardResult) return guardResult;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, leakType } = body;

    if (!customerId || !leakType) {
      return NextResponse.json(
        { error: "customerId and leakType are required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { error } = await sb
      .from("leak_dismissals")
      .delete()
      .eq("user_id", user.id)
      .eq("customer_id", customerId)
      .eq("leak_type", leakType);

    if (error) {
      console.error("[DISMISS] Delete error:", error.message);
      return NextResponse.json(
        { error: "Failed to remove dismissal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DISMISS] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
