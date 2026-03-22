import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/logger";

const log = createLogger("VALIDATION_STATS");

interface ReportSummary {
  totalLeaks?: number;
  leaksFound?: number;
  mrrAtRisk?: number;
  healthScore?: number;
  totalSubscriptions?: number;
  totalMRR?: number;
}

interface ReportCategory {
  type?: string;
  count?: number;
  leaks?: unknown[];
}

interface LeakItem {
  type?: string;
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
    medianLeakTypes: 0,
    avgLeakTypes: 0,
    avgMrrAtRisk: 0,
    medianMrrAtRisk: 0,
    scansOver500: 0,
    scansOver500Rate: 0,
    leakTypeBreakdown: {} as Record<string, number>,
    topLeakTypes: [] as { type: string; count: number; percentage: number }[],
    distribution: { zero: 0, oneTwo: 0, threeFour: 0, fiveSix: 0, sevenPlus: 0 },
    conversionFunnel: { totalProfiles: 0, totalScans: 0, freeUsers: 0, paidUsers: 0, planBreakdown: {} as Record<string, number> },
    timeline: [] as { date: string; scans: number }[],
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(fallback, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch reports and profiles in parallel
    const [reportsResult, profilesResult] = await Promise.all([
      supabase
        .from("reports")
        .select("summary, categories, leaks, created_at, is_test_mode")
        .neq("is_test_mode", true),
      supabase
        .from("profiles")
        .select("plan"),
    ]);

    if (reportsResult.error) {
      log.error("Error fetching reports:", reportsResult.error.message);
      return NextResponse.json(fallback, { status: 500 });
    }

    const reports = reportsResult.data || [];
    const profiles = profilesResult.data || [];

    if (reports.length === 0) {
      // Still compute conversion funnel even with no scans
      const planBreakdown: Record<string, number> = {};
      for (const p of profiles) {
        const plan = p.plan || "free";
        planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
      }
      const paidUsers = profiles.filter(
        (p) => p.plan && p.plan !== "free"
      ).length;

      return NextResponse.json(
        {
          ...fallback,
          conversionFunnel: {
            totalProfiles: profiles.length,
            totalScans: 0,
            freeUsers: profiles.length - paidUsers,
            paidUsers,
            planBreakdown,
          },
        },
        { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
      );
    }

    const totalScans = reports.length;
    let scansWithLeaks = 0;
    let totalLeakCount = 0;
    let totalMrrAtRisk = 0;
    let scansOver500 = 0;
    const leakTypeBreakdown: Record<string, number> = {};
    const leakTypesPerScan: number[] = [];
    const mrrPerScan: number[] = [];

    // Distribution buckets
    const distribution = { zero: 0, oneTwo: 0, threeFour: 0, fiveSix: 0, sevenPlus: 0 };

    // Timeline: scans per day
    const dailyScans: Record<string, number> = {};

    for (const report of reports) {
      const summary = report.summary as ReportSummary | null;
      const categories = report.categories as ReportCategory[] | null;
      const leaks = report.leaks as LeakItem[] | null;

      const leakCount = summary?.leaksFound ?? summary?.totalLeaks ?? 0;
      const mrrAtRisk = summary?.mrrAtRisk ?? 0;

      if (leakCount > 0) scansWithLeaks++;
      totalLeakCount += leakCount;
      totalMrrAtRisk += mrrAtRisk;
      mrrPerScan.push(mrrAtRisk);

      // mrrAtRisk is in cents, $500 = 50000 cents
      if (mrrAtRisk >= 50000) scansOver500++;

      // Count distinct leak types in this scan
      const typesInScan = new Set<string>();

      // From leaks array (more accurate)
      if (leaks && Array.isArray(leaks)) {
        for (const leak of leaks) {
          if (leak.type) {
            typesInScan.add(leak.type);
            leakTypeBreakdown[leak.type] = (leakTypeBreakdown[leak.type] || 0) + 1;
          }
        }
      } else if (categories && Array.isArray(categories)) {
        // Fallback: count from categories
        for (const cat of categories) {
          if (cat.type) {
            typesInScan.add(cat.type);
            const catCount = cat.count ?? (cat.leaks && Array.isArray(cat.leaks) ? cat.leaks.length : 0);
            leakTypeBreakdown[cat.type] = (leakTypeBreakdown[cat.type] || 0) + catCount;
          }
        }
      }

      const distinctTypes = typesInScan.size;
      leakTypesPerScan.push(distinctTypes);

      // Distribution
      if (distinctTypes === 0) distribution.zero++;
      else if (distinctTypes <= 2) distribution.oneTwo++;
      else if (distinctTypes <= 4) distribution.threeFour++;
      else if (distinctTypes <= 6) distribution.fiveSix++;
      else distribution.sevenPlus++;

      // Timeline
      const dateStr = report.created_at
        ? new Date(report.created_at).toISOString().split("T")[0]
        : "unknown";
      if (dateStr !== "unknown") {
        dailyScans[dateStr] = (dailyScans[dateStr] || 0) + 1;
      }
    }

    // Calculate median helper
    function median(arr: number[]): number {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }

    // Average leak types per scan
    const avgLeakTypes =
      totalScans > 0
        ? Math.round((leakTypesPerScan.reduce((a, b) => a + b, 0) / totalScans) * 10) / 10
        : 0;

    // Sort leak types by count descending
    const totalLeaksForPercentage = Object.values(leakTypeBreakdown).reduce((a, b) => a + b, 0);
    const topLeakTypes = Object.entries(leakTypeBreakdown)
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalLeaksForPercentage > 0 ? Math.round((count / totalLeaksForPercentage) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Conversion funnel
    const planBreakdown: Record<string, number> = {};
    for (const p of profiles) {
      const plan = p.plan || "free";
      planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
    }
    const paidUsers = profiles.filter(
      (p) => p.plan && p.plan !== "free"
    ).length;

    // Timeline: last 30 days sorted
    const timeline = Object.entries(dailyScans)
      .map(([date, scans]) => ({ date, scans }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const result = {
      totalScans,
      scansWithLeaks,
      hitRate: totalScans > 0 ? Math.round((scansWithLeaks / totalScans) * 100) : 0,
      avgLeakCount: totalScans > 0 ? Math.round(totalLeakCount / totalScans) : 0,
      avgLeakTypes,
      medianLeakTypes: median(leakTypesPerScan),
      avgMrrAtRisk: totalScans > 0 ? Math.round(totalMrrAtRisk / totalScans) : 0,
      medianMrrAtRisk: median(mrrPerScan),
      scansOver500,
      scansOver500Rate:
        totalScans > 0 ? Math.round((scansOver500 / totalScans) * 100) : 0,
      leakTypeBreakdown,
      topLeakTypes,
      distribution,
      conversionFunnel: {
        totalProfiles: profiles.length,
        totalScans,
        freeUsers: profiles.length - paidUsers,
        paidUsers,
        planBreakdown,
      },
      timeline,
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch (err) {
    log.error("Unexpected error:", err);
    return NextResponse.json(fallback, { status: 500 });
  }
}
