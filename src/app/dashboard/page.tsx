import { PageViewTracker } from "@/components/PageViewTracker";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReportsList from "@/components/dashboard/ReportsList";
import DashboardStats from "@/components/dashboard/DashboardStats";
import HeroRecoveryCard from "@/components/dashboard/HeroRecoveryCard";
import MiniCategoryChart from "@/components/dashboard/MiniCategoryChart";
import AutoScanBanner from "@/components/dashboard/AutoScanBanner";
import { ScanReport } from "@/lib/types";

const PLAN_LABELS: Record<string, string> = {
  free: "Revenue X-Ray",
  pro: "Revenue Shield",
  team: "Revenue Command Center",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  // Fetch profile for plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan as string) || "free";

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
      <PageViewTracker page="dashboard" />
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Your Revenue Dashboard</h1>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
              plan === "free"
                ? "bg-[#2A2A2A] text-[#999]"
                : "bg-[#10B981]/10 text-[#10B981]"
            }`}>
              {PLAN_LABELS[plan] || "Revenue X-Ray"}
            </span>
          </div>
          {plan === "free" && (
            <p className="text-sm text-[#999] mt-1">
              <Link href="/#pricing" className="text-[#10B981] hover:text-[#34D399] transition">
                Upgrade to catch leaks automatically &rarr;
              </Link>
            </p>
          )}
          {plan !== "free" && reports.length > 0 && (
            <p className="text-sm text-[#999] mt-1">
              {reports.length} scan{reports.length === 1 ? "" : "s"} completed
            </p>
          )}
        </div>
        <Link
          href="/scan"
          className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition text-sm whitespace-nowrap"
        >
          Run Another Scan &rarr;
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

      {/* Empty state — Hormozi-style compelling CTA */}
      {reports.length === 0 && (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-8 md:p-16">
          <div className="text-center max-w-lg mx-auto">
            {/* Icon */}
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-white mb-3 md:text-3xl">
              Your first scan is 90 seconds away.
            </h2>
            <p className="text-base text-[#999] mb-8 leading-relaxed">
              Paste your Stripe API key and see exactly where your revenue is leaking.
              The average founder finds{" "}
              <span className="text-white font-semibold">$2,340/month</span>{" "}
              they weren&apos;t collecting.
            </p>

            {/* CTA */}
            <Link
              href="/scan"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-8 py-4 text-lg font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              Paste Your Key &rarr; Get Your Report
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Trust line */}
            <p className="mt-4 text-xs text-[#666]">
              Free. Read-only access. We never touch your data.
            </p>

            {/* Social proof mini */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#999]">
              <span><span className="text-white font-semibold">847+</span> accounts scanned</span>
              <span className="hidden sm:inline text-[#333]">|</span>
              <span className="hidden sm:inline"><span className="text-white font-semibold">94%</span> had at least 1 leak</span>
            </div>
          </div>
        </div>
      )}

      {/* Reports list */}
      {reports.length > 0 && <ReportsList reports={reports} />}
    </div>
  );
}
