"use client";

import { useState } from "react";

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="cta" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-[#10B981]/5 blur-[100px]" />

        {/* Mini stat */}
        <div className="relative mb-8 inline-flex items-center gap-3 rounded-full border border-[#EF4444]/20 bg-[#EF4444]/5 px-5 py-2.5">
          <span className="text-sm font-bold text-[#EF4444]">94% of SaaS accounts</span>
          <span className="text-sm text-[#999]">have at least one revenue leak</span>
        </div>

        <h2 className="relative mb-4 text-3xl font-bold text-white md:text-5xl">
          Stop leaving money on the table
        </h2>
        <p className="relative mb-10 text-lg text-[#999]">
          Every month you wait is another month of leaked revenue.
          <br />
          Scan your Stripe account now and see what you&apos;re missing.
        </p>

        {/* Primary CTA - scan now */}
        <div className="relative mx-auto max-w-md">
          {status === "success" ? (
            <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-6">
              <svg className="mx-auto mb-3 h-8 w-8 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-[#10B981]">You&apos;re in!</p>
              <p className="mt-1 text-xs text-[#999]">We&apos;ll email you within 24 hours with simple instructions to start your free audit.</p>
              <a
                href="/scan"
                className="mt-4 inline-block rounded-lg bg-[#10B981] px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[#34D399]"
              >
                Or scan now →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <a
                href="/scan"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-8 py-4 text-lg font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                Scan My Stripe — Free
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <p className="text-xs text-[#999]">
                Free. No credit card. Results in 2 minutes.
              </p>

              {/* Secondary: email capture */}
              <div className="pt-4 border-t border-[#1A1A1A]">
                <p className="mb-3 text-xs text-[#999]">
                  Not ready to scan yet? Leave your email:
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@yoursaas.com"
                      required
                      className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#111] px-5 py-3 text-sm text-white placeholder-[#999] outline-none transition-colors focus:border-[#10B981]/50"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="cursor-pointer rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-6 py-3 text-sm font-semibold text-white transition-all hover:border-[#10B981]/30 hover:bg-[#222] disabled:opacity-50"
                    >
                      {status === "loading" ? "..." : "Notify Me"}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="mt-2 text-xs text-[#EF4444]">Something went wrong. Please try again.</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Guarantee badge */}
        <div className="mt-12 inline-flex items-center gap-3 rounded-xl border border-[#2A2A2A] bg-[#111] px-6 py-4">
          <svg className="h-8 w-8 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">$1,000/mo Guarantee</div>
            <div className="text-xs text-[#999]">For accounts with $30K+ MRR. If we don&apos;t find $1,000/mo in leaks, you pay nothing</div>
          </div>
        </div>

        {/* Mini testimonial */}
        <div className="mt-8 mx-auto max-w-lg rounded-xl border border-[#2A2A2A] bg-[#111] p-5">
          <p className="text-sm text-[#CCC] italic leading-relaxed">
            &ldquo;We found $3,200/month in expired coupons that nobody noticed. One scan, 2 minutes.&rdquo;
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-white">Sarah M.</span>
            <span className="text-xs text-[#999]">Co-founder, CloudMetrics</span>
            <span className="text-xs text-[#999]">·</span>
            <span className="text-xs font-semibold text-[#10B981]">$85K MRR</span>
          </div>
        </div>
      </div>
    </section>
  );
}
