import { Metadata } from "next";
import ScanForm from "@/components/ScanForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Revenue Leak Scan | RevReclaim",
  description:
    "Scan your Stripe account in under 2 minutes. Find hidden revenue leaks, failed payments, and billing issues costing you money every month.",
};

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-white flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            RevReclaim
          </Link>
          <Link
            href="/"
            className="text-sm text-[#999] hover:text-white transition"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#10B981]">
              Free — No credit card required
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Scan Your Stripe Account
          </h1>
          <p className="text-[#999] max-w-md mx-auto">
            Paste a read-only API key and get a full revenue leak report in
            under 2 minutes. We check 7 types of billing issues.
          </p>
        </div>

        {/* Scan form */}
        <ScanForm />

        {/* What we check */}
        <div className="mt-16 max-w-lg mx-auto">
          <h2 className="text-center text-sm font-semibold text-[#999] uppercase tracking-wider mb-6">
            What we scan for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: "💳",
                title: "Failed Payments",
                desc: "Open invoices losing you revenue",
              },
              {
                icon: "👻",
                title: "Ghost Subscriptions",
                desc: "Past due, unpaid, and stuck subs",
              },
              {
                icon: "⏰",
                title: "Expiring Cards",
                desc: "Cards that expire within 90 days",
              },
              {
                icon: "🏷️",
                title: "Expired Coupons",
                desc: "Coupons that expired but still discount",
              },
              {
                icon: "♾️",
                title: "Forever Discounts",
                desc: "Coupons with no end date ever",
              },
              {
                icon: "📉",
                title: "Legacy Pricing",
                desc: "Customers on old cheaper plans",
              },
              {
                icon: "🚫",
                title: "Missing Payment Methods",
                desc: "Active subs with no card on file",
              },
            ].map((check) => (
              <div
                key={check.title}
                className="flex items-start gap-3 p-3 bg-[#111111] rounded-lg border border-[#2A2A2A]"
              >
                <span className="text-lg">{check.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {check.title}
                  </p>
                  <p className="text-xs text-[#666]">{check.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
