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
    <section ref={sectionRef} id="cta" className="relative overflow-hidden border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-brand/5 blur-[100px]" />

        {/* Mini stat */}
        <div className="relative mb-8 inline-flex items-center gap-3 rounded-full border border-danger/20 bg-danger/5 px-5 py-2.5">
          <span className="text-sm font-bold text-danger">94% of SaaS accounts</span>
          <span className="text-sm text-text-muted">have at least one revenue leak</span>
        </div>

        {/* Headline — future-focused (85/15 Rule) */}
        <h2 className="relative mb-4 text-3xl font-bold text-white md:text-5xl lg:text-6xl">
          Stop the leak.
          <br />
          <span className="text-text-muted">Keep the money.</span>
        </h2>

        {/* Future outcome + urgency (85/15 Rule + Hormozi Hack #8) */}
        <p className="relative mb-10 text-base md:text-lg text-text-muted leading-relaxed">
          No new customers. No new features. Just money that was always yours,
          finally hitting your account.
          <br />
          <span className="text-white font-semibold break-words">
            The average founder recovers $2,340/mo. The scan takes 90 seconds.
          </span>
        </p>

        {/* Primary CTA — prescriptive (Hormozi Hack #11) */}
        <div className="relative mx-auto max-w-md">
          {status === "success" ? (
            <div className="rounded-xl border border-brand/30 bg-brand/5 p-6">
              <svg className="mx-auto mb-3 h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-brand">You&apos;re in!</p>
              <p className="mt-1 text-xs text-text-muted">We&apos;ll email you within 24 hours with simple instructions to start your free audit.</p>
              <a
                href="/scan"
                className="mt-4 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-black min-h-[40px] transition-all hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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
                className="group inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-black min-h-[44px] transition-all hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Get My Free $2,847 Audit
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <p className="text-xs text-text-muted">
                90 seconds from now, you&apos;ll know exactly where your money is going.
              </p>

              {/* Secondary: email capture */}
              <div className="pt-4 border-t border-border-light">
                <p className="mb-3 text-xs text-text-muted">
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
                      className="flex-1 rounded-xl border border-border bg-surface px-5 py-3 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-brand/50"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="cursor-pointer rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm font-semibold text-white min-h-[40px] transition-all hover:border-brand/30 hover:bg-surface-lighter disabled:opacity-50"
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

        {/* Recovery agent callout — Hormozi: give them a taste */}
        <div className="mt-10 mx-auto max-w-lg rounded-xl border border-brand/20 bg-brand/5 p-5 text-left">
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="font-semibold text-brand">Your first fix is free.</span>{" "}
            See a $499 failed payment sitting there for 12 days? Hit one button.
            Our AI agent retries the charge. That money hits your account next billing cycle.
            No signup required.
          </p>
        </div>

        {/* Guarantee badge */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-6 py-4">
          <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">The $1,000/mo Guarantee</div>
            <div className="text-xs text-text-muted">We find at least $1,000/month in recoverable revenue, or every paid plan is free. No fine print.</div>
          </div>
        </div>

        {/* Mini testimonial */}
        <div className="mt-8 mx-auto max-w-lg rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-text-secondary italic leading-relaxed">
            &ldquo;I pasted the key expecting nothing. 90 seconds later I&apos;m staring at a list of 23 expired coupons. $3,200/month we were just giving away.&rdquo;
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-white">Sarah M.</span>
            <span className="text-xs text-text-muted">Co-founder, CloudMetrics</span>
            <span className="text-xs text-text-muted">&middot;</span>
            <span className="text-xs font-semibold text-brand">$85K MRR</span>
          </div>
        </div>

        {/* P.S. section — second most-read element (Hormozi Hack #10) */}
        <div className="mt-16 mx-auto max-w-lg px-4 md:px-0 text-left">
          <p className="text-sm md:text-base text-text-muted leading-relaxed">
            <span className="font-semibold text-white">P.S.</span> Imagine opening your
            billing dashboard tomorrow knowing that every subscription is collecting,
            coupons are correct, cards are current. That&apos;s what our founders tell us
            after their first scan. Not &ldquo;wow, I had leaks&rdquo; but &ldquo;I finally know my
            revenue number is real.&rdquo; Run the free scan. 90 seconds. The worst case is you
            wasted 90 seconds. The best case? You probably don&apos;t want to think about how long those leaks have been running.
          </p>
          <p className="mt-4 text-sm md:text-base text-text-muted leading-relaxed">
            <span className="font-semibold text-white">P.P.S.</span> We scan
            Stripe, Polar, and Paddle. If
            your SaaS is doing $30K–$500K MRR, I&apos;d bet money
            (literally, that&apos;s our $1,000/mo guarantee) that you have leaks right now.
          </p>
        </div>
      </div>
    </section>
  );
}
