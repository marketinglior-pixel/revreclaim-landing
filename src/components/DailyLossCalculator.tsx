"use client";

import { useState, useEffect, useRef } from "react";
import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

const LEAK_RATE = 0.05; // 5% average leak rate

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function DailyLossCalculator() {
  const sectionRef = useSectionView("daily_loss_calculator");
  const [mrr, setMrr] = useState(50000);
  const [secondsOnPage, setSecondsOnPage] = useState(0);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsOnPage((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const monthlyLoss = Math.round(mrr * LEAK_RATE);
  const dailyLoss = Math.round(monthlyLoss / 30);
  const lostSinceOpen = ((dailyLoss / 86400) * secondsOnPage).toFixed(2);
  const yearlyLoss = monthlyLoss * 12;

  function handleSliderChange(value: number) {
    setMrr(value);
    if (!hasTrackedRef.current) {
      trackEvent("calculator_used", null, { location: "daily_loss", mrr: value }).catch(() => {});
      hasTrackedRef.current = true;
    }
  }

  // Progress must match the browser's linear thumb position exactly
  const progressPercent = ((mrr - 10000) / (500000 - 10000)) * 100;

  return (
    <section ref={sectionRef} className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-danger">
          The cost of waiting
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          While you&apos;re reading this, money is leaving your account.
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-lg text-text-muted">
          Slide to your MRR. See the math. It&apos;s not pretty, but it&apos;s honest.
        </p>

        {/* Calculator card */}
        <div className="rounded-2xl border border-border bg-surface p-8 md:p-10">
          {/* MRR Input */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium text-text-muted">
              Your Monthly Recurring Revenue (MRR)
            </label>
            <div className="mb-3 text-center text-3xl font-extrabold text-white">
              ${formatCurrency(mrr)}<span className="text-lg font-normal text-text-muted">/mo</span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={mrr}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-light accent-brand"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #10B981 ${progressPercent}%, #1A1A1A ${progressPercent}%, #1A1A1A 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>$10K</span>
              <span>$100K</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Loss breakdown */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LossCard
              label="Monthly leak"
              value={`$${formatCurrency(monthlyLoss)}`}
              sub="/month"
              color="text-warning"
            />
            <LossCard
              label="Daily"
              value={`$${formatCurrency(dailyLoss)}`}
              sub="/day"
              color="text-danger"
            />
            <LossCard
              label="Since you opened this page"
              value={`$${lostSinceOpen}`}
              sub=""
              color="text-danger"
              pulse
            />
            <LossCard
              label="By end of year"
              value={`$${formatCurrency(yearlyLoss)}`}
              sub="/year"
              color="text-danger"
            />
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <a
              href="/onboarding"
              onClick={() => {
                trackEvent("cta_clicked", null, { location: "calculator", action: "scan", mrr }).catch(() => {});
                trackCTAClick("calculator", "scan");
              }}
              className="group inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-bold text-black min-h-[52px] transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              Show Me My Leaks
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LossCard({ label, value, sub, color, pulse }: {
  label: string;
  value: string;
  sub: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-center">
      <div className="mb-1 text-xs text-text-muted">{label}</div>
      <div className={`text-2xl font-bold ${color} ${pulse ? "animate-pulse" : ""}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  );
}
