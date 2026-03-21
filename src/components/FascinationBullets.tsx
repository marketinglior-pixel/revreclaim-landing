"use client";

import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

const bullets = [
  {
    text: "a single expired coupon can cost you $800/month for 6+ months before anyone notices? One Reddit founder found out the hard way. Stripe\u2019s dashboard doesn\u2019t flag it. At all.",
  },
  {
    text: "\u201Cnever-expiring\u201D discounts from your launch promotion are still running on every customer who signed up with them? ProfitWell data shows discounts of 30-50% reduce lifetime value by 32%.",
  },
  {
    text: "ghost subscriptions (customers marked \u201Cactive\u201D who stopped using your product months ago) inflate your MRR? And when they finally notice the charge, they don\u2019t just cancel. They chargeback.",
  },
  {
    text: "your legacy customers \u2014 the ones who signed up when your price was lower \u2014 are still paying the old rate? If your price went from $29 to $49, that\u2019s $20/month per customer you\u2019re leaving on the table. Multiply that by 50 customers. That\u2019s $12,000/year.",
  },
  {
    text: "failed payments that Stripe\u2019s Smart Retries couldn\u2019t recover just... sit there? BillingEngine\u2019s founder found \u201C$12K+ in recoverable revenue sitting in failed invoices\u201D for 4 months. No alert. No notification. Nothing.",
  },
  {
    text: "credit cards expiring next month won\u2019t trigger any proactive alert from Stripe? You only find out when the payment fails. And by then, some of those customers are already gone.",
  },
  {
    text: "$129 billion is lost every year to failed payments alone (Recurly, 2024)? That\u2019s just one of 10 leak types. The other 9? Nobody\u2019s even counting.",
  },
];

export function FascinationBullets() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="section-divider" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-warning/[0.02] blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 pt-16">
        <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-warning/80">
          What you don&apos;t know
        </div>
        <h2 className="mb-12 font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Things your billing account isn&apos;t telling you
        </h2>

        <div className="space-y-5">
          {bullets.map((bullet, i) => (
            <div
              key={i}
              className="glass-card-hover rounded-2xl p-5 md:p-6"
            >
              <p className="text-sm leading-[1.8] text-white/45">
                <span className="font-semibold text-white/70">Did you know</span> that {bullet.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/scan"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "fascination_bullets", action: "scan" }).catch(() => {});
              trackCTAClick("fascination_bullets", "scan");
            }}
            className="btn-shimmer group inline-flex items-center gap-2.5 rounded-xl bg-brand px-8 py-4 text-base font-bold text-black min-h-[52px] transition-all duration-300 hover:bg-brand-light hover:brightness-110"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="mt-4 text-sm text-white/30">
            Free. 90 seconds. No credit card.
          </p>
        </div>
      </div>
    </section>
  );
}
