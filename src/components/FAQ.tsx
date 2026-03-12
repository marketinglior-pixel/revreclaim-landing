"use client";

import { useState } from "react";
import { useSectionView } from "@/hooks/useSectionView";

const faqs = [
  {
    q: "Is my billing data safe?",
    a: "Short answer: we literally can't touch your billing. The key you give us is read-only, enforced by Stripe, Paddle, and Polar at the platform level. Not a promise we make. A technical limitation they enforce. The key is used once during the scan and never stored.",
  },
  {
    q: "Do you store my customers' personal information?",
    a: "No. We never pull customer names from your billing platform. Customer emails are masked in the UI (j***@example.com) and encrypted in our database. With Privacy Mode enabled, even masked emails and customer IDs are hidden from your dashboard and exports. Recovery actions still work. Customer data is decrypted only server-side when sending dunning emails.",
  },
  {
    q: "Which billing platforms do you support?",
    a: "Stripe, Polar.sh, and Paddle. Select your platform on the scan page and we'll walk you through creating an API key. Each platform gets a tailored scan covering the leak types it supports.",
  },
  {
    q: "What permissions does the API key need?",
    a: "Read access for: Customers, Subscriptions, Invoices, Products, Prices, Coupons, and Payment Methods (exact names vary by platform). We show you exactly how on the scan page. Takes about 60 seconds.",
  },
  {
    q: "How long does the scan take?",
    a: "Under 90 seconds for most accounts. Larger accounts (1,000+ customers) may take up to 3 minutes. You'll see real-time progress as each category gets scanned.",
  },
  {
    q: "What exactly do you scan for?",
    a: "10 checks: expired coupons, legacy pricing, forever discounts, ghost subscriptions, expiring cards, uncollected revenue, missing payment methods, unbilled overages, expired trials, and duplicate subscriptions. Each one is a different way money slips through your billing without anyone noticing.",
  },
  {
    q: "What do I do with the report?",
    a: "Open it. See the leak, the dollar amount, and a one-sentence fix. Click the link, it takes you straight to that customer in your billing dashboard. Fix it. That money hits your account next billing cycle.",
  },
  {
    q: "What if you don't find any leaks?",
    a: "Then your billing is in better shape than 94% of the accounts we've scanned. You get a perfect health score and some peace of mind. The free scan costs you nothing either way. If you're on a paid plan and we find less than $1,000/mo, you pay nothing. We can afford that guarantee because honestly, it almost never happens.",
  },
  {
    q: "Is this the same as chargeback recovery?",
    a: "No. Chargeback tools handle disputed payments. We find revenue you earned but aren't collecting: expired discounts still running, subscriptions stuck in failed states, cards about to expire, pricing that was never updated. Different problem, different fix.",
  },
  {
    q: "Can I cancel the monthly plan anytime?",
    a: "Yes. No contracts, no lock-in. Cancel anytime from your dashboard. Your data is deleted within 30 days of cancellation.",
  },
  /* Exclusionary FAQ (Hormozi Hack #3): explicitly say who it's NOT for */
  {
    q: "Is this worth it if I have fewer than 50 customers?",
    a: "Probably not. Revenue leaks compound with scale. If you have 10 customers, you probably know each one by name and you'd catch these issues manually. RevReclaim is built for the stage where your billing account has grown past what one person can monitor. Typically 100+ customers, $30K+ MRR.",
  },
  /* Trust FAQ — damaging admission + transparency (Hormozi Hack #5) */
  {
    q: "Why should I trust you with my billing data?",
    a: "Honestly? You probably shouldn't trust anyone blindly with your billing data. That's exactly why we built RevReclaim to work with restricted, read-only API keys, scoped to specific resources. We can't modify your data, we never see card numbers, and we don't store the key after the scan.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useSectionView("faq");

  return (
    <section ref={sectionRef} id="faq" className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
          FAQ
        </div>
        {/* Headline — damaging admission builds trust (Hormozi Hack #5) */}
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Questions we get from skeptical founders
        </h2>
        <p className="mb-12 text-center text-lg text-text-muted italic">
          (Good. You should be skeptical.)
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface/80 backdrop-blur-sm transition-colors hover:border-border"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}>
                <div className="overflow-hidden">
                  <div className="border-t border-border-light px-5 py-4 text-sm leading-relaxed text-text-muted">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
