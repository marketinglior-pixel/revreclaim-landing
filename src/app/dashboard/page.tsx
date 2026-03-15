import { PageViewTracker } from "@/components/PageViewTracker";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReportsList from "@/components/dashboard/ReportsList";
import DashboardStats from "@/components/dashboard/DashboardStats";
import HeroRecoveryCard from "@/components/dashboard/HeroRecoveryCard";
import MiniCategoryChart from "@/components/dashboard/MiniCategoryChart";
import AutoScanBanner from "@/components/dashboard/AutoScanBanner";
import RecoveryActionsBanner from "@/components/dashboard/RecoveryActionsBanner";
import RecoveryImpactCard from "@/components/dashboard/RecoveryImpactCard";
import { NPSSurvey } from "@/components/dashboard/NPSSurvey";
import { PostScanSurvey } from "@/components/report/PostScanSurvey";
import { ScanReport } from "@/lib/types";
import ConversionTracker from "@/components/dashboard/ConversionTracker";
import TrendChart from "@/components/dashboard/TrendChart";
import { extractTrends } from "@/lib/report-trends";

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
    .select("id, created_at, platform, summary, categories, leaks")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const reports: ScanReport[] = (reportRows || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    platform: (row.platform as string) || "stripe",
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
  const firstScanDate = reports.length > 0 ? reports[reports.length - 1].scannedAt : null;

  return (
    <div className="space-y-8">
      <PageViewTracker page="dashboard" />
      <ConversionTracker plan={plan} />
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Your Revenue Dashboard</h1>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
              plan === "free"
                ? "bg-border text-text-muted"
                : "bg-brand/10 text-brand"
            }`}>
              {PLAN_LABELS[plan] || "Revenue X-Ray"}
            </span>
          </div>
          {plan === "free" && (
            <p className="text-sm text-text-muted mt-1">
              <Link href="/#pricing" className="text-brand hover:text-brand-light transition">
                Upgrade to catch leaks automatically &rarr;
              </Link>
            </p>
          )}
          {plan !== "free" && reports.length > 0 && (
            <p className="text-sm text-text-muted mt-1">
              {reports.length} scan{reports.length === 1 ? "" : "s"} completed
            </p>
          )}
        </div>
        <Link
          href="/scan"
          className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition text-sm whitespace-nowrap"
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

      {/* Degradation messaging — compare latest vs previous scan */}
      {reports.length >= 2 && (() => {
        const latest = reports[0].summary;
        const previous = reports[1].summary;
        const newLeaks = (latest.leaksFound ?? 0) - (previous.leaksFound ?? 0);
        const mrrChange = Math.round(((latest.mrrAtRisk ?? 0) - (previous.mrrAtRisk ?? 0)) / 100);
        if (newLeaks > 0 || mrrChange > 0) {
          return (
            <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 px-5 py-4">
              <svg className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-white">
                  Since your last scan:
                  {newLeaks > 0 && ` ${newLeaks} new leak${newLeaks !== 1 ? "s" : ""} found.`}
                  {mrrChange > 0 && ` Revenue at risk increased by $${mrrChange}/mo.`}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Billing leaks compound over time. Fix the new ones before they grow.
                </p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Recovery impact — shows actual recovered revenue (Pro/Team only) */}
      {plan !== "free" && latestReport && <RecoveryImpactCard />}

      {/* Stats from latest report */}
      {latestReport && <DashboardStats report={latestReport} />}

      {/* Recovery actions banner */}
      {latestReport && <RecoveryActionsBanner userId={user.id} />}

      {/* Post-Scan Survey — moved from report page, shows 48+ hours after first scan */}
      {latestReport && <PostScanSurvey firstScanDate={firstScanDate} />}

      {/* NPS Survey — shows 7+ days after first scan, max once per 90 days */}
      <NPSSurvey firstScanDate={firstScanDate} />

      {/* Category breakdown */}
      {latestReport && latestReport.categories.length > 0 && (
        <MiniCategoryChart
          categories={latestReport.categories}
          reportId={latestReport.id}
        />
      )}

      {/* Trend chart — show when user has 2+ reports */}
      {reports.length >= 2 && (
        <TrendChart points={extractTrends(reports)} />
      )}

      {/* Empty state — sell the problem, not the product */}
      {reports.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-8 md:p-16">
          <div className="text-center max-w-lg mx-auto">
            {/* Icon */}
            <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>

            {/* Headline — problem-first */}
            <h2 className="text-2xl font-bold text-white mb-3 md:text-3xl">
              Your billing account has holes you can&apos;t see.
            </h2>
            <p className="text-base text-text-muted mb-4 leading-relaxed">
              Expired coupons still giving discounts. Failed payments nobody retried. Customers
              on pricing you raised months ago. These are real holes &mdash; and your billing
              dashboard won&apos;t tell you about them.
            </p>
            <p className="text-sm text-text-dim mb-8">
              Most SaaS companies have <span className="text-danger font-semibold">3-8% of MRR</span> leaking
              through gaps like these. The average scan finds <span className="text-white font-semibold">$2,340/month</span> in lost revenue.
            </p>

            {/* CTA */}
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-lg font-bold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              Find My Billing Leaks
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Trust line */}
            <p className="mt-4 text-xs text-text-dim">
              Read-only access &middot; Key deleted after scan &middot; 90 seconds &middot; Free
            </p>
          </div>
        </div>
      )}

      {/* Reports list */}
      {reports.length > 0 && <ReportsList reports={reports} />}
    </div>
  );
}
