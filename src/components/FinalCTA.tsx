"use client";

import { useState } from "react";
import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";
import { trackNewsletterSignup } from "@/lib/conversion-tracking";

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const sectionRef = useSectionView("final_cta");

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
        trackEvent("newsletter_signup", null, { location: "final_cta" }).catch(() => {});
        trackNewsletterSignup();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section ref={sectionRef} id="cta" className="relative overflow-hidden py-20 md:py-28">
      <div className="section-divider" />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-brand/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center pt-16">
        {/* Headline — display font */}
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-5xl lg:text-6xl">
          Your billing might be
          <br />
          <span className="text-white/35">leaking right now.</span>
        </h2>

        {/* Sub */}
        <p className="mb-10 text-[15px] md:text-base text-white/40 leading-relaxed max-w-xl mx-auto">
          If even one of those 10 leak types is happening in your account,
          it&apos;s costing you money right now. Not &ldquo;maybe.&rdquo;
          Not &ldquo;potentially.&rdquo; Right now.
          <br /><br />
          <span className="text-white/55">
            The scan is free. It takes 90 seconds. Your API key is read-only,
            and you can delete it the moment the scan finishes.
            The only thing you risk by scanning is finding out how much you&apos;ve been losing.
          </span>
        </p>

        {/* Primary CTA */}
        <div className="mx-auto max-w-md">
          {status === "success" ? (
            <div className="glass-card rounded-2xl border-brand/15 p-6">
              <svg className="mx-auto mb-3 h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-brand">You&apos;re in!</p>
              <p className="mt-1 text-xs text-white/35">We&apos;ll email you within 24 hours with simple instructions to start your free audit.</p>
              <a
                href="/scan"
                className="mt-4 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-black min-h-[40px] transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Or scan now &rarr;
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <a
                href="/scan"
                onClick={() => {
                  trackEvent("cta_clicked", null, { location: "final_cta", action: "scan" }).catch(() => {});
                }}
                className="btn-shimmer group inline-flex items-center gap-2.5 rounded-xl bg-brand px-9 py-4 text-[17px] font-bold text-black min-h-[56px] transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
              >
                Show Me My Leaks
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <p className="text-xs text-white/30">
                Free. 90 seconds. No credit card. No signup.
              </p>
              <a
                href="/demo/dashboard"
                className="inline-block text-sm text-text-muted hover:text-brand transition-colors"
              >
                Or try the demo dashboard first &rarr;
              </a>

              {/* Secondary: email capture */}
              <div className="pt-5">
                <div className="section-divider mb-5" />
                <p className="mb-3 text-xs text-white/25">
                  Not ready to scan yet? Leave your email:
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@yoursaas.com"
                      required
                      className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-brand/30 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 min-h-[44px] transition-all duration-300 hover:border-brand/20 hover:bg-brand/[0.06] hover:text-white disabled:opacity-50"
                    >
                      {status === "loading" ? "..." : "Notify Me"}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="mt-2 text-xs text-danger">Something went wrong. Please try again.</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Guarantee badge — glass card */}
        <div className="mt-12 inline-flex items-center gap-4 glass-card rounded-xl px-6 py-4">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-brand/[0.06] blur-md" />
            <svg className="relative h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white/90">The $1,000/mo Guarantee</div>
            <div className="text-xs text-white/30">We find at least $1,000/month in recoverable revenue, or every paid plan is free.</div>
          </div>
        </div>

        {/* P.S. — founder voice */}
        <div className="mt-14 mx-auto max-w-lg px-4 md:px-0 text-left">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-brand/30 to-emerald-600/20 flex items-center justify-center border border-brand/15">
              <span className="text-lg font-bold text-brand font-display">L</span>
            </div>
            <div>
              <p className="text-sm md:text-[15px] text-white/40 leading-[1.7]">
                <span className="font-semibold text-white/80">P.S.</span> I built RevReclaim because I couldn&apos;t find
                a tool that just checks a Stripe account for billing mistakes. Not a
                dashboard. Not an analytics platform. Not something that takes a week to set up.
              </p>
              <p className="mt-4 text-sm md:text-[15px] text-white/40 leading-[1.7]">
                Just paste a key, see what&apos;s leaking, decide what to do about it. That&apos;s it.
              </p>
              <p className="mt-4 text-sm md:text-[15px] text-white/40 leading-[1.7]">
                We support Stripe, Polar, and Paddle. The scan is free. If we
                can&apos;t find $1,000/month in leaks, paid plans are free too.
                I don&apos;t know how to make this lower risk.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-white/80">Lior Cohen</p>
                  <p className="text-[11px] text-white/25">Founder, RevReclaim</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
