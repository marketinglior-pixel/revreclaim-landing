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
    a: "No. We never pull customer names from your billing platform. Customer emails are masked in the UI (j***@example.com) and encrypted in our database. With Privacy Mode enabled, even masked emails and customer IDs are hidden from your dashboard and exports.",
  },
  {
    q: "Which billing platforms do you support?",
    a: "Stripe, Polar.sh, and Paddle. Select your platform on the scan page and we'll walk you through creating an API key. Each platform gets a tailored scan covering the leak types it supports.",
  },
  {
    q: "What exactly do you scan for?",
    a: "10 checks: expired coupons, legacy pricing, forever discounts, stuck subscriptions, expiring cards, uncollected revenue, missing payment methods, unbilled overages, expired trials, and duplicate subscriptions. Each one is a different way money slips through your billing without anyone noticing.",
  },
  {
    q: "What does CRM intelligence add to the scan?",
    a: "The free scan finds your leaks and shows dollar amounts. CRM intelligence (Pro/Team plans) connects to your HubSpot and adds context to each leak: is this customer active? When did they last engage? Do they have open deals? This turns a list of problems into a prioritized action plan.",
  },
  {
    q: "What happens when a Stripe coupon expires?",
    a: "When a Stripe coupon's redeem_by date passes, the coupon stops accepting new redemptions — but existing subscriptions keep the discount indefinitely. Stripe does not auto-remove expired coupons from active subscriptions. This means you could have 'expired' coupons still reducing your revenue months or years later. RevReclaim scans for these zombie discounts and shows you exactly which subscriptions are affected and how much they're costing you.",
  },
  {
    q: "Is this the same as chargeback recovery?",
    a: "No. Chargeback tools handle disputed payments. We find revenue you earned but aren't collecting: expired discounts still running, subscriptions stuck in failed states, cards about to expire, pricing that was never updated. Different problem, different fix.",
  },
  {
    q: "How is my data encrypted?",
    a: "TLS 1.3 in transit. AES-256-GCM at rest (for auto-scan users). Row Level Security in the database. Your API key lives in memory during the scan and gets discarded immediately after. Never written to a database, never logged, never visible to our team.",
  },
  {
    q: "Can I cancel the monthly plan anytime?",
    a: "Yes. No contracts, no lock-in. Cancel anytime from your dashboard. Your data is deleted within 30 days of cancellation.",
  },
  {
    q: "Is this worth it if I have fewer than 50 customers?",
    a: "Probably not. Revenue leaks compound with scale. If you have 10 customers, you probably know each one by name and you'd catch these issues manually. RevReclaim is built for the stage where your billing account has grown past what one person can monitor. Typically 100+ customers, $30K+ MRR.",
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
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Questions we get a lot
        </h2>
        <p className="mb-12 text-center text-lg text-text-muted">
          Honest answers. No fine print.
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
