import { Metadata } from "next";
import ScanForm from "@/components/ScanForm";
import Link from "next/link";
import { PageViewTracker } from "@/components/PageViewTracker";
import { LeakIcon } from "@/components/LeakIcons";

export const metadata: Metadata = {
  title: "Paste Your API Key → See Your Leaks | RevReclaim",
  description:
    "Paste an API key from Stripe, Polar, or Paddle. See every revenue leak in your account in 90 seconds. Real customer names. Real dollar amounts. Free forever.",
  alternates: { canonical: "https://revreclaim.com/scan" },
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

        {/* Security trust banner */}
        <div className="max-w-lg mx-auto mb-6">
          <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
            <svg className="h-5 w-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-sm text-text-muted">
              <span className="font-medium text-brand">Read-only access only.</span>{" "}
              Your key is processed in memory and never stored.{" "}
              <Link href="/security" className="text-brand underline underline-offset-2 hover:text-brand-light transition">
                How we protect your data &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Scan form */}
        <ScanForm />

        {/* Demo escape hatch for hesitant visitors */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-muted">
            Not ready to connect?{" "}
            <Link href="/demo" className="text-brand underline underline-offset-2 hover:text-brand-light transition">
              See a demo report with real data →
            </Link>
          </p>
        </div>

        {/* Trust section — what the API key can and can't do */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-6">
            Your data stays yours
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* What we CAN do */}
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-brand">What we read</span>
              </div>
              <ul className="space-y-1.5 text-xs text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">&#10003;</span>
                  Subscriptions &amp; their status
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">&#10003;</span>
                  Invoices &amp; payment history
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">&#10003;</span>
                  Coupons &amp; discount details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">&#10003;</span>
                  Product prices (current vs. old)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-0.5">&#10003;</span>
                  Card expiry dates (not numbers)
                </li>
              </ul>
            </div>
            {/* What we CAN'T do */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-sm font-semibold text-danger">What we can&apos;t do</span>
              </div>
              <ul className="space-y-1.5 text-xs text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Create charges or modify billing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Cancel or change subscriptions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Access credit card numbers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Delete any data from your account
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Store your API key after the scan
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* What we check */}
        <div className="mt-16 max-w-lg mx-auto">
          <h2 className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-6">
            What we scan for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: "Expired Coupons",
                desc: "Ended months ago. Discount still running.",
              },
              {
                title: "Legacy Pricing",
                desc: "Old customers on old prices. New ones pay more.",
              },
              {
                title: "Forever Discounts",
                desc: "Set to 'forever.' They'll never pay full price.",
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
                title: "Uncollected Revenue",
                desc: "Cards that declined. Invoices sitting open.",
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
