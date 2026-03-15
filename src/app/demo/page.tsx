"use client";

import { computeBillingHealth } from "@/lib/billing-health";
import ReportHeader from "@/components/report/ReportHeader";
import ReportSummary from "@/components/report/ReportSummary";
import BillingHealthInsights from "@/components/report/BillingHealthInsights";
import LeakCategoryChart from "@/components/report/LeakCategoryChart";
import LeakTable from "@/components/report/LeakTable";
import ReportCTA from "@/components/report/ReportCTA";
import RecoveryBanner from "@/components/report/RecoveryBanner";
import QuickWins from "@/components/report/QuickWins";
import AgentSimulation from "@/components/report/AgentSimulation";
import PlaybookSection from "@/components/report/PlaybookSection";
import { DEMO_REPORT, addDemoEnrichment } from "./demo-data";

// ──────────────────────────────────────────────────────────────
// DEMO SCENARIO: ScaleFlow — A B2B SaaS doing $250K MRR
// They ran RevReclaim and found 102 billing issues.
// Health score: 48 ("Poor") — they scaled fast without billing hygiene.
// All amounts in cents. Risk-adjusted where applicable.
// ──────────────────────────────────────────────────────────────

// Apply CRM enrichment
addDemoEnrichment(DEMO_REPORT);

// Compute billing health from demo data (after enrichment, so 7th dimension shows)
const DEMO_BILLING_HEALTH = computeBillingHealth(
  DEMO_REPORT.summary,
  DEMO_REPORT.categories,
  DEMO_REPORT.leaks
);

export default function DemoReportPage() {
  return (
    <div className="min-h-screen bg-surface-dim">
      <ReportHeader
        scannedAt={DEMO_REPORT.scannedAt}
        isLoggedIn={true}
        report={DEMO_REPORT}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Recovery Banner */}
        <RecoveryBanner
          mrrAtRisk={DEMO_REPORT.summary.mrrAtRisk}
          isLoggedIn={true}
          pendingActionsCount={0}
        />

        {/* Summary Cards + Health Score */}
        <ReportSummary summary={DEMO_REPORT.summary} leaks={DEMO_REPORT.leaks} />

        {/* Billing Health Breakdown */}
        <BillingHealthInsights billingHealth={DEMO_BILLING_HEALTH} />

        {/* Category Breakdown Chart */}
        <LeakCategoryChart categories={DEMO_REPORT.categories} />

        {/* Quick Wins — start here summary */}
        <QuickWins leaks={DEMO_REPORT.leaks} />

        {/* Recovery Playbooks — step-by-step fix guides */}
        <PlaybookSection leaks={DEMO_REPORT.leaks} />

        {/* All Leaks Table */}
        <div id="leak-table">
          <LeakTable leaks={DEMO_REPORT.leaks} />
        </div>

        {/* Recovery Agent Simulation */}
        <AgentSimulation leaks={DEMO_REPORT.leaks} />

        {/* CTA */}
        <ReportCTA mrrAtRisk={DEMO_REPORT.summary.mrrAtRisk} recoveryPotential={DEMO_REPORT.summary.recoveryPotential} />
      </main>
    </div>
  );
}
