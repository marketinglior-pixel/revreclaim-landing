"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is my data safe?",
    a: "We use Stripe's official API with read-only access. We never see credit card numbers, never modify billing, never touch customer data. We only read subscription and pricing metadata.",
  },
  {
    q: "What if I use Chargebee or Paddle instead of Stripe?",
    a: "We're starting with Stripe (80%+ of SaaS companies use it). Chargebee and Paddle integrations are on the roadmap. Join the waitlist and we'll notify you when they're ready.",
  },
  {
    q: "How long does the scan take?",
    a: "Under 2 minutes for most accounts. Larger accounts (1,000+ customers) may take up to 5 minutes.",
  },
  {
    q: "What do I do with the report?",
    a: 'Each leak comes with a specific fix action: "Cancel coupon X for customer Y" or "Migrate customer Z to current pricing." Copy, paste, done.',
  },
  {
    q: "What if you don't find any leaks?",
    a: "If we don't find at least $1,000/month in leaked revenue, you pay nothing. We're that confident in what we find.",
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
                className="flex w-full items-center justify-between p-5 text-left"
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
