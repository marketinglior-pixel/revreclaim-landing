"use client";

import ReportHeader from "@/components/report/ReportHeader";
import ReportSummary from "@/components/report/ReportSummary";
import LeakTable from "@/components/report/LeakTable";
import ReportCTA from "@/components/report/ReportCTA";
import QuickWins from "@/components/report/QuickWins";
import AgentSimulation from "@/components/report/AgentSimulation";
import { DEMO_REPORT, addDemoEnrichment } from "./demo-data";

// ──────────────────────────────────────────────────────────────
// DEMO SCENARIO: ScaleFlow — A B2B SaaS doing $250K MRR
// They ran RevReclaim and found 102 billing issues.
// Health score: 48 ("Poor") — they scaled fast without billing hygiene.
// All amounts in cents. Risk-adjusted where applicable.
// ──────────────────────────────────────────────────────────────

// Apply CRM enrichment
addDemoEnrichment(DEMO_REPORT);

export default function DemoReportPage() {
  return (
    <div className="min-h-screen bg-surface-dim">
      <ReportHeader
        scannedAt={DEMO_REPORT.scannedAt}
        isLoggedIn={true}
        report={DEMO_REPORT}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards + Health Score */}
        <ReportSummary summary={DEMO_REPORT.summary} leaks={DEMO_REPORT.leaks} />

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-4 text-xs text-text-dim py-1">
          <span>Read-only API access</span>
          <span className="text-white/10">·</span>
          <span>AES-256 encrypted</span>
          <span className="text-white/10">·</span>
          <span>Key deleted after scan</span>
        </div>

        {/* Quick Wins — start here summary */}
        <QuickWins leaks={DEMO_REPORT.leaks} />

        {/* Recovery Agent Simulation — shows agents auto-fixing leaks live */}
        <div id="agent-simulation">
          <AgentSimulation leaks={DEMO_REPORT.leaks} />
        </div>

        {/* All Leaks Table — fix details gated in demo */}
        <div id="leak-table">
          <LeakTable leaks={DEMO_REPORT.leaks} isDemo={true} />
        </div>

        {/* CTA */}
        <ReportCTA mrrAtRisk={DEMO_REPORT.summary.mrrAtRisk} recoveryPotential={DEMO_REPORT.summary.recoveryPotential} />
      </main>
    </div>
  );
}
