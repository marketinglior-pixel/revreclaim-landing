"use client";

import { useState } from "react";
import { useSectionView } from "@/hooks/useSectionView";

const faqs = [
  {
    q: "I'm not giving my API key to a tool I don't know.",
    a: "Fair. And honestly, good instinct. Here's what matters: the API key is read-only. RevReclaim physically cannot modify, delete, or change anything in your Stripe account. We can only read your billing data to run the scan. You can revoke the key from your Stripe dashboard the second the scan finishes. We don't store your key after scanning. And the first scan is free, so you're not even giving us payment info. Try it once. If the results match your Stripe data, you'll know the tool is real. If they don't, you're out 90 seconds.",
  },
  {
    q: "Stripe already handles my billing. Why do I need this?",
    a: "Stripe handles payment processing, and they're excellent at it. But billing health is a different thing entirely. Stripe doesn't alert you when a coupon expires but keeps running. Stripe doesn't flag ghost subscriptions (status says \"active,\" even if the customer hasn't logged in for 6 months). Stripe doesn't compare your current pricing to what legacy customers are actually paying. Those are 8 out of 10 leak types that nobody, including Stripe, is monitoring. Stripe does processing. Not billing health. That gap is where the money leaks.",
  },
  {
    q: "How do I know your numbers are accurate?",
    a: "This is actually the thing we care about most. Our numbers come directly from your Stripe data. Nothing estimated. Nothing modeled. If our MRR number doesn't match your Stripe Dashboard exactly, something is wrong on our end and we want to know. Every leak we flag is verifiable. Click through to the customer page in Stripe and confirm it yourself. We also use risk-adjusted amounts, which means we err on the conservative side. We'd rather show you $1,800 in real leaks than $5,000 in inflated ones.",
  },
  {
    q: "I already have Baremetrics / Churnkey / a dunning tool.",
    a: "Good. Keep it. Dunning tools are great at recovering failed payments. But that's 1 out of 10 billing leak types. What about expired coupons that are still giving discounts? Ghost subscriptions inflating your MRR? Legacy pricing on customers who should be paying more? Never-expiring discounts reducing lifetime value by 32%? Your dunning tool doesn't check any of those. Nobody's tool does. RevReclaim covers the 10 leak types that every other tool in the market ignores.",
  },
  {
    q: "3-5% leakage doesn't sound like much.",
    a: "It doesn't, until you turn the percentage into dollars. 3% of $50K MRR is $1,500 per month. That's $18,000 per year. 5% is $2,500 per month, $30,000 per year. And that's the conservative estimate. One founder lost $800/month from a single expired coupon for 6 months. That's $4,800 from one leak. Most accounts have multiple. The percentage sounds small. The dollar amount never does.",
  },
  {
    q: "I can just check this myself.",
    a: "You can. A manual Stripe audit takes about 4-8 hours and covers maybe 3-5 leak types if you're thorough. The real question isn't whether you can do it. The question is: will you do it every week? For all 10 leak types? Consistently? RevReclaim does it in 90 seconds, every week, automatically.",
  },
  {
    q: "This sounds too good to be true.",
    a: "Honestly? I get that. \"90 seconds, free, finds thousands in leaks\" sounds like a pitch. So don't trust the pitch. Run the free scan. The results will either match your Stripe data or they won't. If our MRR matches yours exactly, and the leaks we flag are verifiable in your own dashboard, then you'll know it's real. If anything looks off, close the tab and forget about us. We'd rather you judge us by the scan than by this page.",
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
          Questions founders actually ask
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
