import { PageViewTracker } from "@/components/PageViewTracker";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReportsList from "@/components/dashboard/ReportsList";
import DashboardStats from "@/components/dashboard/DashboardStats";

import RecoveryActionsBanner from "@/components/dashboard/RecoveryActionsBanner";
import { ScanReport } from "@/lib/types";
import ConversionTracker from "@/components/dashboard/ConversionTracker";

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

  const latestReport = reports[0] || null;

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

      {/* Stats from latest report */}
      {latestReport && <DashboardStats report={latestReport} />}

      {/* Action Required — prominent CTA to fix leaks */}
      {latestReport && latestReport.summary.leaksFound > 0 && (
        <div className="rounded-xl border-2 border-danger/30 bg-danger/5 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                Action Required
              </h3>
              <p className="text-sm text-text-muted mt-1">
                {latestReport.summary.leaksFound} leaks found totaling ${Math.round(latestReport.summary.mrrAtRisk / 100).toLocaleString()}/mo.
                Fix the highest-impact ones first.
              </p>
            </div>
            <Link
              href="/dashboard/actions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition whitespace-nowrap"
            >
              Fix Priority Leaks
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Recovery actions banner — shows count */}
      {latestReport && <RecoveryActionsBanner userId={user.id} />}

      {/* Recent Activity — top 5 leaks as simple feed */}
      {latestReport && latestReport.leaks.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Leaks Found</h3>
          <div className="space-y-3">
            {latestReport.leaks
              .sort((a, b) => (b.monthlyImpact ?? 0) - (a.monthlyImpact ?? 0))
              .slice(0, 5)
              .map((leak, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      leak.severity === "critical" || leak.severity === "high" ? "bg-danger" : "bg-danger/50"
                    }`} />
                    <span className="text-sm text-text-muted">{leak.description?.slice(0, 60) || leak.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-danger">
                    ${Math.round((leak.monthlyImpact ?? 0) / 100).toLocaleString()}/mo
                  </span>
                </div>
              ))}
          </div>
          <Link
            href={`/report/${latestReport.id}`}
            className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:text-brand-light transition"
          >
            View all {latestReport.leaks.length} leaks
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
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
