"use client";

import { useSectionView } from "@/hooks/useSectionView";

const fitItems = [
  "You have 100+ subscriptions and can't check each one manually",
  "You use Stripe, Paddle, or Polar and trust the dashboard to show everything",
  "You're doing $30K\u2013$500K in MRR but never audited your billing",
  "You've raised prices at least once and aren't sure everyone migrated",
  "You use coupons or discounts and don't know which ones are still active",
  "Nobody on your team is responsible for billing hygiene",
];

export function BestFitSection() {
  const sectionRef = useSectionView("best-fit");

  return (
    <section ref={sectionRef} className="relative py-16 md:py-20">
      <div className="section-divider" />

      <div className="mx-auto max-w-4xl px-6 pt-12">
        <div className="glass-card rounded-2xl p-8 md:p-10 border-brand/10">
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.15em] text-brand/80">
            Is this for you?
          </div>
          <h3 className="mb-6 font-display text-xl font-bold text-white md:text-2xl">
            You probably have billing leaks if&hellip;
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {fitItems.map((text) => (
              <div key={text} className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 transition-all duration-300 hover:border-brand/10 hover:bg-brand/[0.02]">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-white/55">{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/40">
            Sound familiar? The scan is free. Run it and find out.
            Most founders are surprised by what they find.
          </p>
        </div>
      </div>
    </section>
  );
}
