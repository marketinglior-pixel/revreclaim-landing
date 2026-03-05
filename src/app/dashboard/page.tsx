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

      {/* Empty state — guided onboarding */}
      {reports.length === 0 && (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Welcome! Let&apos;s find your hidden revenue.</h3>
            <p className="text-sm text-[#999] max-w-md mx-auto">
              Most SaaS companies lose 3-8% of MRR to billing leaks. Follow these steps to find and fix yours.
            </p>
          </div>

          {/* Onboarding steps */}
          <div className="max-w-lg mx-auto space-y-4">
            {/* Step 1 — Active */}
            <Link
              href="/scan"
              className="flex items-center gap-4 p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 hover:bg-[#10B981]/10 transition group"
            >
              <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                  Run your first free scan
                </p>
                <p className="text-xs text-[#999]">
                  Connect your Stripe API key and scan for revenue leaks. Takes under 2 minutes.
                </p>
              </div>
              <svg className="w-5 h-5 text-[#10B981] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Step 2 — Locked */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#2A2A2A] opacity-50">
              <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                <span className="text-[#666] font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#666]">
                  Review your Revenue Leak Report
                </p>
                <p className="text-xs text-[#555]">
                  See exactly which leaks are costing you and get direct Stripe fix links.
                </p>
              </div>
              <svg className="w-5 h-5 text-[#333] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Step 3 — Locked */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#2A2A2A] opacity-50">
              <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                <span className="text-[#666] font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#666]">
                    Enable weekly auto-scans
                  </p>
                  <span className="px-1.5 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold rounded">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-[#555]">
                  Catch new leaks automatically every week before they add up.
                </p>
              </div>
              <svg className="w-5 h-5 text-[#333] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Reports list */}
      {reports.length > 0 && <ReportsList reports={reports} />}
    </div>
  );
}
