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
    q: "What does CRM intelligence add to the scan?",
    a: "The free scan finds your leaks and shows dollar amounts. CRM intelligence (Pro/Team plans) connects to your HubSpot and adds context to each leak: is this customer active? When did they last engage? Do they have open deals? This turns a list of problems into a prioritized action plan.",
  },
  {
    q: "Do I need HubSpot to use RevReclaim?",
    a: "No. The free scan works with just your billing platform (Stripe, Paddle, or Polar). HubSpot CRM integration is optional and available on Pro and Team plans. Without it, you get every leak with dollar amounts and fix instructions. With it, you also get customer context that helps you prioritize. Think of it as the difference between a list and a strategy.",
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
    a: "10 checks: expired coupons, legacy pricing, forever discounts, stuck subscriptions, expiring cards, uncollected revenue, missing payment methods, unbilled overages, expired trials, and duplicate subscriptions. Each one is a different way money slips through your billing without anyone noticing.",
  },
  {
    q: "What do I do with the report?",
    a: "Open it. See the leak, the dollar amount, and a one-sentence fix. Click the link, it takes you straight to that customer in your billing dashboard. Fix it. That money hits your account next billing cycle.",
  },
  {
    q: "What if you don't find any leaks?",
    a: "Then your billing is clean. You get a perfect health score and some peace of mind. The free scan costs you nothing either way. If you're on a paid plan and we find less than $1,000/mo, you pay nothing.",
  },
  {
    q: "Can't I just audit my billing manually?",
    a: "You can. It takes 4-6 hours to go through every subscription, invoice, coupon, and payment method. RevReclaim does the same thing in 90 seconds across 10 categories. The math is pretty simple.",
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
