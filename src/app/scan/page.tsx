import { Metadata } from "next";
import ScanForm from "@/components/ScanForm";
import Link from "next/link";
import { PageViewTracker } from "@/components/PageViewTracker";
import { LeakIcon } from "@/components/LeakIcons";

export const metadata: Metadata = {
  title: "Paste Your API Key → See Your Leaks | RevReclaim",
  description:
    "Paste an API key from Stripe, Polar, Lemon Squeezy, or Paddle. See every revenue leak in your account in 90 seconds. Real customer names. Real dollar amounts. Free forever.",
};

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-surface-dim">
      <PageViewTracker page="scan" />
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-white flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            RevReclaim
          </Link>
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-white transition"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            <span className="text-xs font-medium text-brand">
              Free forever &middot; Avg. recovery: $2,340/mo
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Paste your key. See your leaks.
          </h1>
          <p className="text-text-muted max-w-md mx-auto">
            In 90 seconds, you&apos;ll see every customer name, every dollar amount,
            and exactly where to click to fix each leak.
            The average founder finds $2,340/month they weren&apos;t collecting.
          </p>
        </div>

        {/* Scan form */}
        <ScanForm />

        {/* What we check */}
        <div className="mt-16 max-w-lg mx-auto">
          <h2 className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-6">
            What we scan for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: "Failed Payments",
                desc: "Cards that declined. Invoices sitting open.",
              },
              {
                title: "Ghost Subscriptions",
                desc: "Stuck in limbo. Not active, not canceled.",
              },
              {
                title: "Expiring Cards",
                desc: "Cards about to expire. Next payment will fail.",
              },
              {
                title: "Expired Coupons",
                desc: "Ended months ago. Discount still running.",
              },
              {
                title: "Forever Discounts",
                desc: "Set to 'forever.' They'll never pay full price.",
              },
              {
                title: "Legacy Pricing",
                desc: "Old customers on old prices. New ones pay more.",
              },
              {
                title: "Missing Payment",
                desc: "No card on file. Next charge = guaranteed fail.",
              },
            ].map((check) => (
              <div
                key={check.title}
                className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-border"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                  <LeakIcon type={check.title} className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {check.title}
                  </p>
                  <p className="text-xs text-text-muted">{check.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
