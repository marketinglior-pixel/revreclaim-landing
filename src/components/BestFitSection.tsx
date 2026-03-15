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
    <section ref={sectionRef} className="border-t border-border-light py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 md:p-10">
          <h3 className="mb-6 text-xl font-bold text-white md:text-2xl">
            You probably have billing leaks if&hellip;
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {fitItems.map((text) => (
              <div key={text} className="flex items-start gap-3">
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
                <span className="text-sm text-text-secondary">{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-text-muted">
            Sound familiar? The scan is free &mdash; run it and find out.
            Most founders are surprised by what they find.
          </p>
        </div>
      </div>
    </section>
  );
}
