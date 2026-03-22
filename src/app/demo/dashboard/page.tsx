"use client";

import Link from "next/link";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { DEMO_REPORT } from "../demo-data";

// Simulated recovery data for the demo
const DEMO_RECOVERED_ACTIONS = [
  { type: "Failed Payment Retry", customer: "Acme Corp", amount: 49900, status: "recovered", date: "Mar 21" },
  { type: "Expired Coupon Removed", customer: "GrowthLabs", amount: 15000, status: "recovered", date: "Mar 20" },
  { type: "Dunning Email Sent", customer: "CloudFlow", amount: 29900, status: "pending", date: "Mar 19" },
  { type: "Failed Payment Retry", customer: "DataSync", amount: 9900, status: "recovered", date: "Mar 18" },
  { type: "Card Update Request", customer: "Nextera", amount: 19900, status: "sent", date: "Mar 17" },
];

const DEMO_SCAN_HISTORY = [
  { date: "Mar 22, 2026", health: 52, leaks: 97, mrrAtRisk: 980400, isLatest: true },
  { date: "Mar 15, 2026", health: 48, leaks: 102, mrrAtRisk: 1073100, isLatest: false },
  { date: "Mar 8, 2026", health: 45, leaks: 108, mrrAtRisk: 1124000, isLatest: false },
];

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Demo banner */}
      <div className="bg-brand/10 border-b border-brand/20 px-4 py-2 text-center">
        <p className="text-sm text-brand font-medium">
          Demo Dashboard — Sample data from a $250K MRR SaaS company.{" "}
          <Link href="/scan" className="underline underline-offset-2 font-bold hover:text-brand-light transition">
            Scan your own account free &rarr;
          </Link>
        </p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-[200px] border-r border-border bg-surface min-h-screen p-4">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-bold text-white">RevReclaim</span>
          </Link>

          <nav className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand/10 text-brand text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
              Control Center
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-text-muted text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              Fix Leaks
              <span className="ml-auto text-xs bg-danger/20 text-danger px-1.5 py-0.5 rounded-full font-bold">97</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-text-muted text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </div>
          </nav>

          <div className="mt-auto pt-4">
            <Link
              href="/scan"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              Run Scan
            </Link>
            <div className="mt-3 px-1">
              <p className="text-xs text-text-dim truncate">demo@scaleflow.com</p>
              <p className="text-[10px] text-brand font-medium">Pro Plan</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl">
          <h1 className="text-xl font-bold text-white mb-1">Control Center</h1>
          <p className="text-sm text-text-muted mb-6">ScaleFlow — $250K MRR</p>

          {/* Stats */}
          <DashboardStats report={DEMO_REPORT} />

          {/* Action Required */}
          <div className="mt-6 rounded-xl border-2 border-danger/30 bg-danger/5 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  Needs Your Attention
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  97 issues found, $9,804/mo at risk. Start with the biggest one.
                </p>
              </div>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition whitespace-nowrap"
              >
                Fix Priority Leaks
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Recent Agent Activity */}
          <div className="mt-6 rounded-xl border border-border bg-surface p-6">
            <h3 className="text-sm font-bold text-white mb-4">Recent Agent Activity</h3>
            <div className="space-y-3">
              {DEMO_RECOVERED_ACTIONS.map((action, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      action.status === "recovered" ? "bg-brand" : action.status === "pending" ? "bg-warning" : "bg-info"
                    }`} />
                    <div>
                      <p className="text-sm text-white">{action.type}</p>
                      <p className="text-xs text-text-dim">{action.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${action.status === "recovered" ? "text-brand" : "text-text-muted"}`}>
                      ${(action.amount / 100).toLocaleString()}/mo
                    </p>
                    <p className="text-[10px] text-text-dim">{action.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scan History */}
          <div className="mt-6 rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Scan History</h3>
              <span className="text-xs text-text-dim">{DEMO_SCAN_HISTORY.length} scans</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-dim border-b border-white/[0.04]">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Health</th>
                  <th className="text-left py-2 font-medium">Leaks</th>
                  <th className="text-left py-2 font-medium">MRR at Risk</th>
                  <th className="text-right py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_SCAN_HISTORY.map((scan, i) => (
                  <tr key={i} className="border-b border-white/[0.03] last:border-0">
                    <td className="py-3 text-sm text-white">{scan.date}</td>
                    <td className="py-3">
                      <span className={`text-sm font-bold ${scan.health >= 70 ? "text-brand" : scan.health >= 50 ? "text-warning" : "text-danger"}`}>
                        {scan.health}
                      </span>
                      <span className="text-xs text-text-dim"> /100</span>
                    </td>
                    <td className="py-3 text-sm text-white">{scan.leaks}</td>
                    <td className="py-3 text-sm text-danger">${(scan.mrrAtRisk / 100).toLocaleString()}/mo</td>
                    <td className="py-3 text-right">
                      <Link href="/demo" className="text-sm text-brand hover:text-brand-light transition">
                        View Report &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Right panel */}
        <aside className="hidden lg:block w-[260px] border-l border-border p-6">
          <h4 className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">Where You&apos;re Losing</h4>
          <div className="space-y-2 mb-8">
            {[
              { type: "Failed Payments", amount: "$4,382" },
              { type: "Expired Coupons", amount: "$2,340" },
              { type: "Legacy Pricing", amount: "$1,890" },
              { type: "Ghost Subscriptions", amount: "$1,192" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{item.type}</span>
                <span className="text-danger font-medium">{item.amount}/mo</span>
              </div>
            ))}
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-sm">
              <span className="text-text-dim">Total at risk</span>
              <span className="text-danger font-bold">$9,804/mo</span>
            </div>
          </div>

          <h4 className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">Recovery Progress</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Recovered</span>
              <span className="text-brand font-bold">$947</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Pending</span>
              <span className="text-warning font-medium">$299</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Remaining</span>
              <span className="text-text-dim">$8,558</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 rounded-lg border border-brand/20 bg-brand/5 p-4">
            <p className="text-xs text-brand font-medium mb-2">This is a demo</p>
            <p className="text-xs text-text-muted mb-3">Scan your own Stripe account and see your real numbers.</p>
            <Link
              href="/scan"
              className="block w-full text-center px-3 py-2 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition text-sm"
            >
              Scan My Account Free
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
