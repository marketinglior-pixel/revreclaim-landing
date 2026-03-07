"use client";

import { useState } from "react";
import { useSectionView } from "@/hooks/useSectionView";

const faqs = [
  {
    q: "Is my billing data safe?",
    a: "Yes. We only read data — we cannot modify your billing, create charges, or access card numbers. All supported platforms (Stripe, Polar, Paddle) support restricted read-only keys. Your key is used only during the scan and is never stored or logged.",
  },
  {
    q: "Which billing platforms do you support?",
    a: "We support Stripe, Polar.sh, and Paddle. Select your platform on the scan page and we'll guide you through creating an API key. Each platform gets a tailored scan covering the leak types it supports.",
  },
  {
    q: "What permissions does the API key need?",
    a: "Read access for: Customers, Subscriptions, Invoices, Products, Prices, Coupons, and Payment Methods (exact names vary by platform). We provide step-by-step instructions on the scan page. It takes about 60 seconds to create.",
  },
  {
    q: "How long does the scan take?",
    a: "Under 90 seconds for most accounts. Larger accounts (1,000+ customers) may take up to 3 minutes. You'll see real-time progress as we scan each category.",
  },
  {
    q: "What exactly do you scan for?",
    a: "We run 7 automated checks: (1) Failed payments with open invoices, (2) Ghost subscriptions stuck in bad states, (3) Expiring cards within 90 days, (4) Expired coupons still discounting, (5) Forever discounts with no end date, (6) Legacy pricing below current rates, (7) Missing payment methods on active subscriptions.",
  },
  {
    q: "What do I do with the report?",
    a: "Open the report. See the customer name. See the dollar amount. See the one-sentence fix. Click the link — it takes you straight to that customer in your billing dashboard. Fix it. That money hits your account next billing cycle.",
  },
  {
    q: "What if you don't find any leaks?",
    a: "Then your billing is in better shape than 94% of the SaaS accounts we've scanned. You'll get a perfect health score and genuine peace of mind. The free scan costs you nothing either way. If you're on a paid plan and we find less than $1,000/mo, you pay nothing. We can afford that guarantee because it almost never happens.",
  },
  {
    q: "Is this the same as chargeback recovery?",
    a: "No. Chargeback tools handle disputed payments. We find revenue you earned but aren't collecting: expired discounts still running, subscriptions stuck in failed states, cards about to expire, and outdated pricing that was never updated. Different problem, different fix.",
  },
  {
    q: "Can I cancel the monthly plan anytime?",
    a: "Yes. No contracts, no lock-in. Cancel anytime from your dashboard. Your data is deleted within 30 days of cancellation.",
  },
  /* Exclusionary FAQ (Hormozi Hack #3): explicitly say who it's NOT for */
  {
    q: "Is this worth it if I have fewer than 50 customers?",
    a: "Probably not. Revenue leaks compound with scale. If you have 10 customers, you probably know each one by name and you'd catch these issues manually. RevReclaim is built for the stage where your billing account has grown past what one person can monitor — typically 100+ customers, $30K+ MRR.",
  },
  /* Trust FAQ — damaging admission + transparency (Hormozi Hack #5) */
  {
    q: "Why should I trust you with my billing data?",
    a: "Fair question. Here's the honest answer: you shouldn't blindly trust anyone with your billing data. That's why we designed RevReclaim to work with restricted, read-only API keys — scoped to specific resources. We only perform read operations, never modify your data, never see card numbers, and never store the key after the scan.",
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
