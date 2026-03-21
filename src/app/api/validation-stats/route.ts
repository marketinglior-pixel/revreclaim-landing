import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/logger";

const log = createLogger("VALIDATION_STATS");

interface ReportSummary {
  totalLeaks?: number;
  mrrAtRisk?: number;
  healthScore?: number;
}

interface ReportCategory {
  type?: string;
  leaks?: unknown[];
}

/**
 * Admin-only validation metrics endpoint.
 * Returns aggregate scan data to measure product-market fit.
 * Protected by ADMIN_SECRET bearer token. Cached 5 minutes.
 */
export async function GET(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const auth = request.headers.get("authorization");

  if (!adminSecret || auth !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fallback = {
    totalScans: 0,
    scansWithLeaks: 0,
    hitRate: 0,
    avgLeakCount: 0,
    avgMrrAtRisk: 0,
    scansOver500: 0,
    scansOver500Rate: 0,
    leakTypeBreakdown: {} as Record<string, number>,
    topLeakTypes: [] as { type: string; count: number }[],
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(fallback, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: reports, error } = await supabase
      .from("reports")
      .select("summary, categories, is_test_mode")
      .neq("is_test_mode", true);

    if (error) {
      log.error("Error fetching reports:", error.message);
      return NextResponse.json(fallback, { status: 500 });
    }

    if (!reports || reports.length === 0) {
      return NextResponse.json(fallback, {
        headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
      });
    }

    const totalScans = reports.length;
    let scansWithLeaks = 0;
    let totalLeakCount = 0;
    let totalMrrAtRisk = 0;
    let scansOver500 = 0;
    const leakTypeBreakdown: Record<string, number> = {};

    for (const report of reports) {
      const summary = report.summary as ReportSummary | null;
      const categories = report.categories as ReportCategory[] | null;

      const leaks = summary?.totalLeaks ?? 0;
      const mrrAtRisk = summary?.mrrAtRisk ?? 0;

      if (leaks > 0) scansWithLeaks++;
      totalLeakCount += leaks;
      totalMrrAtRisk += mrrAtRisk;

      // mrrAtRisk is in cents, $500 = 50000 cents
      if (mrrAtRisk >= 50000) scansOver500++;

      // Count leak types from categories
      if (categories && Array.isArray(categories)) {
        for (const cat of categories) {
          if (cat.type && cat.leaks && Array.isArray(cat.leaks)) {
            leakTypeBreakdown[cat.type] =
              (leakTypeBreakdown[cat.type] || 0) + cat.leaks.length;
          }
        }
      }
    }

    // Sort leak types by count descending
    const topLeakTypes = Object.entries(leakTypeBreakdown)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const result = {
      totalScans,
      scansWithLeaks,
      hitRate: totalScans > 0 ? Math.round((scansWithLeaks / totalScans) * 100) : 0,
      avgLeakCount: totalScans > 0 ? Math.round(totalLeakCount / totalScans) : 0,
      avgMrrAtRisk: totalScans > 0 ? Math.round(totalMrrAtRisk / totalScans) : 0,
      scansOver500,
      scansOver500Rate:
        totalScans > 0 ? Math.round((scansOver500 / totalScans) * 100) : 0,
      leakTypeBreakdown,
      topLeakTypes,
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch (err) {
    log.error("Unexpected error:", err);
    return NextResponse.json(fallback, { status: 500 });
  }
}
