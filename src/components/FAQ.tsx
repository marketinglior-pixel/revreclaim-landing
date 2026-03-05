"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is my Stripe data safe?",
    a: "Yes. You create a restricted API key with read-only permissions. We can only read data — we cannot modify your billing, create charges, or access card numbers. The key is used only during the scan and is never stored or logged.",
  },
  {
    q: "What permissions does the API key need?",
    a: "Read access for: Customers, Subscriptions, Invoices, Products, Prices, Coupons, and Payment Methods. We provide step-by-step instructions on the scan page. It takes about 60 seconds to create.",
  },
  {
    q: "What if I use Chargebee or Paddle instead of Stripe?",
    a: "We're starting with Stripe (80%+ of SaaS companies use it). Chargebee and Paddle integrations are on the roadmap. Leave your email and we'll notify you when they're ready.",
  },
  {
    q: "How long does the scan take?",
    a: "Under 2 minutes for most accounts. Larger accounts (1,000+ customers) may take up to 5 minutes. You'll see real-time progress as we scan.",
  },
  {
    q: "What exactly do you scan for?",
    a: "We run 7 automated checks: (1) Failed payments with open invoices, (2) Ghost subscriptions stuck in bad states, (3) Expiring cards within 90 days, (4) Expired coupons still discounting, (5) Forever discounts with no end date, (6) Legacy pricing below current rates, (7) Missing payment methods on active subscriptions.",
  },
  {
    q: "What do I do with the report?",
    a: 'Each leak comes with a specific fix action: "Contact customer to update payment method" or "Migrate customer Z to current pricing." We tell you exactly where to go in Stripe Dashboard to fix it.',
  },
  {
    q: "What if you don't find any leaks?",
    a: "The free scan is always free. If your billing is clean, you'll get a perfect health score and peace of mind. If you upgrade to a paid plan and we don't find at least $1,000/month in recoverable revenue, you pay nothing.",
  },
  {
    q: "Is this the same as chargeback recovery?",
    a: "No. Chargeback tools handle disputed payments. We find revenue you earned but aren't collecting: expired discounts still running, subscriptions stuck in failed states, cards about to expire, and outdated pricing that was never updated. Different problem, different fix.",
  },
  {
    q: "Can I cancel the monthly plan anytime?",
    a: "Yes. No contracts, no lock-in. Cancel anytime from your dashboard. Your data is deleted within 30 days of cancellation.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          FAQ
        </div>
        <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
          Common questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#2A2A2A] bg-[#111] transition-colors hover:border-[#333]"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-[#666] transition-transform ${
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
              {open === i && (
                <div className="border-t border-[#1A1A1A] px-5 py-4 text-sm leading-relaxed text-[#999]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
