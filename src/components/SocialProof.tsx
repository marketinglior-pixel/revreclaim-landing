"use client";

import { ScanCounter } from "@/components/ScanCounter";

/**
 * Social proof section — only shows real, verifiable data.
 * No fake testimonials. No fabricated stats.
 * Testimonials will be added when we have real customer quotes.
 */

const stats = [
  { value: "10", label: "Leak types checked per scan" },
  { value: "90s", label: "Average scan time" },
  { value: "3", label: "Platforms supported" },
];

export function SocialProof() {
  return (
    <section className="border-t border-border-light py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
          How it works
        </div>
        <h2 className="mb-4 text-center text-2xl font-bold text-white md:text-3xl">
          Paste a key. Wait 90 seconds. See what&apos;s leaking.
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-text-muted">
          No signup. No credit card. No sales call.
          Just your billing data, analyzed for 10 types of revenue leaks.
        </p>

        {/* Stats bar — real data only */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {/* Dynamic scan count from DB */}
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 text-center">
            <div className="text-2xl font-bold text-white md:text-3xl">
              <ScanCounter />
            </div>
            <div className="mt-1 text-xs text-text-muted">Scans completed</div>
          </div>

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface p-5 text-center"
            >
              <div className="text-2xl font-bold text-white md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Placeholder for future testimonials */}
        {/* When we have real customer quotes, add them here */}
      </div>
    </section>
  );
}
