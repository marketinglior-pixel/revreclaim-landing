import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReportsList from "@/components/dashboard/ReportsList";
import DashboardStats from "@/components/dashboard/DashboardStats";
import HeroRecoveryCard from "@/components/dashboard/HeroRecoveryCard";
import MiniCategoryChart from "@/components/dashboard/MiniCategoryChart";
import AutoScanBanner from "@/components/dashboard/AutoScanBanner";
import { ScanReport } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  // Fetch reports
  const { data: reportRows } = await supabase
    .from("reports")
    .select("id, created_at, summary, categories, leaks")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const reports: ScanReport[] = (reportRows || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    scannedAt: row.created_at as string,
    summary: row.summary as unknown as ScanReport["summary"],
    categories: row.categories as unknown as ScanReport["categories"],
    leaks: row.leaks as unknown as ScanReport["leaks"],
  }));

  // Fetch scan config
  const { data: scanConfig } = await supabase
    .from("scan_configs")
    .select("is_active, next_scan_at, scan_frequency")
    .eq("user_id", user.id)
    .single();

  const latestReport = reports[0] || null;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#999] mt-1">
            {reports.length > 0
              ? `${reports.length} scan${reports.length === 1 ? "" : "s"} completed`
              : "No scans yet. Run your first scan to find revenue leaks."}
          </p>
        </div>
        <Link
          href="/scan"
          className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition text-sm"
        >
          Run New Scan
        </Link>
      </div>

      {/* Auto-scan banner */}
      <AutoScanBanner
        hasConfig={!!scanConfig}
        isActive={(scanConfig as Record<string, unknown>)?.is_active as boolean || false}
        nextScanAt={(scanConfig as Record<string, unknown>)?.next_scan_at as string || null}
        frequency={(scanConfig as Record<string, unknown>)?.scan_frequency as string || "weekly"}
      />

      {/* Hero recovery card */}
      {latestReport && <HeroRecoveryCard report={latestReport} />}

      {/* Stats from latest report */}
      {latestReport && <DashboardStats report={latestReport} />}

      {/* Category breakdown */}
      {latestReport && latestReport.categories.length > 0 && (
        <MiniCategoryChart
          categories={latestReport.categories}
          reportId={latestReport.id}
        />
      )}

      {/* Empty state */}
      {reports.length === 0 && (
        <div className="rounded-2xl border border-[#2A2A2A] border-dashed bg-[#111] p-12 text-center">
          <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No scans yet</h3>
          <p className="text-sm text-[#999] mb-6 max-w-sm mx-auto">
            Run your first scan to find revenue leaks hiding in your Stripe account.
            It takes under 2 minutes.
          </p>
          <Link
            href="/scan"
            className="inline-flex px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition"
          >
            Start Free Scan
          </Link>
        </div>
      )}

      {/* Reports list */}
      {reports.length > 0 && <ReportsList reports={reports} />}
    </div>
  );
}
