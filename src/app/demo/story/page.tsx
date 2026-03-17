"use client";

import { computeBillingHealth } from "@/lib/billing-health";
import { isActionableLeak } from "@/lib/leak-categories";
import ReportHeader from "@/components/report/ReportHeader";
import ReportSummary from "@/components/report/ReportSummary";
import BillingHealthInsights from "@/components/report/BillingHealthInsights";
import LeakCategoryChart from "@/components/report/LeakCategoryChart";
import LeakTable from "@/components/report/LeakTable";
import ReportCTA from "@/components/report/ReportCTA";
import RecoveryBanner from "@/components/report/RecoveryBanner";
import QuickWins from "@/components/report/QuickWins";
import { STORY_REPORT } from "./story-data";

const STORY_BILLING_HEALTH = computeBillingHealth(
  STORY_REPORT.summary,
  STORY_REPORT.categories,
  STORY_REPORT.leaks
);

const ACTIONABLE_LEAK_COUNT = STORY_REPORT.leaks.filter((l) =>
  isActionableLeak(l.type)
).length;

export default function StoryDemoPage() {
  return (
    <div className="min-h-screen bg-surface-dim">
      <ReportHeader
        scannedAt={STORY_REPORT.scannedAt}
        isLoggedIn={true}
        report={STORY_REPORT}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <RecoveryBanner
          mrrAtRisk={STORY_REPORT.summary.mrrAtRisk}
          isLoggedIn={true}
          isDemo={true}
          actionableLeakCount={ACTIONABLE_LEAK_COUNT}
        />

        <ReportSummary summary={STORY_REPORT.summary} leaks={STORY_REPORT.leaks} />

        <BillingHealthInsights billingHealth={STORY_BILLING_HEALTH} />

        <LeakCategoryChart categories={STORY_REPORT.categories} />

        <QuickWins leaks={STORY_REPORT.leaks} />

        <div id="leak-table">
          <LeakTable leaks={STORY_REPORT.leaks} isDemo={true} />
        </div>

        <ReportCTA
          mrrAtRisk={STORY_REPORT.summary.mrrAtRisk}
          recoveryPotential={STORY_REPORT.summary.recoveryPotential}
        />
      </main>
    </div>
  );
}
