"use client";

import { useState } from "react";
import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";

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
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section ref={sectionRef} id="cta" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-[#10B981]/5 blur-[100px]" />

        {/* Mini stat */}
        <div className="relative mb-8 inline-flex items-center gap-3 rounded-full border border-[#EF4444]/20 bg-[#EF4444]/5 px-5 py-2.5">
          <span className="text-sm font-bold text-[#EF4444]">94% of SaaS accounts</span>
          <span className="text-sm text-[#999]">have at least one revenue leak</span>
        </div>

        {/* Headline — specific, personal (Hormozi Hack #1) */}
        <h2 className="relative mb-4 text-3xl font-bold text-white md:text-5xl">
          You already earned this money.
          <br />
          <span className="text-[#999]">It&apos;s sitting in Stripe, uncollected.</span>
        </h2>

        {/* Time-decay urgency — real financial cost of waiting (Hormozi Hack #8) */}
        <p className="relative mb-10 text-base md:text-lg text-[#999] leading-relaxed">
          A $2,340/month leak doesn&apos;t start when you find it.
          It started months ago. Every month you wait is another $2,340 gone.
          <br />
          <span className="text-white font-semibold break-words">
            The scan takes 90 seconds. The cost of waiting is $78/day.
          </span>
        </p>

        {/* Primary CTA — prescriptive (Hormozi Hack #11) */}
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
                Or scan now &rarr;
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <a
                href="/scan"
                onClick={() => trackEvent("cta_clicked", null, { location: "final_cta", action: "scan" }).catch(() => {})}
                className="group inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-8 py-4 text-lg font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                Paste Your Key &rarr; See Your Leaks (Free)
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <p className="text-xs text-[#999]">
                Free. No credit card. No sales call. 90 seconds to your report.
              </p>

              {/* Secondary: email capture */}
              <div className="pt-4 border-t border-[#1A1A1A]">
                <p className="mb-3 text-xs text-[#999]">
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
            <div className="text-sm font-semibold text-white">The $1,000/mo Promise</div>
            <div className="text-xs text-[#999]">We find at least $1,000/month in recoverable revenue, or every paid plan is free. No fine print.</div>
          </div>
        </div>

        {/* Mini testimonial */}
        <div className="mt-8 mx-auto max-w-lg rounded-xl border border-[#2A2A2A] bg-[#111] p-5">
          <p className="text-sm text-[#CCC] italic leading-relaxed">
            &ldquo;I pasted the key expecting nothing. 90 seconds later I&apos;m staring at a list of 23 expired coupons — $3,200/month we were just giving away.&rdquo;
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-white">Sarah M.</span>
            <span className="text-xs text-[#999]">Co-founder, CloudMetrics</span>
            <span className="text-xs text-[#999]">&middot;</span>
            <span className="text-xs font-semibold text-[#10B981]">$85K MRR</span>
          </div>
        </div>

        {/* P.S. section — second most-read element (Hormozi Hack #10) */}
        <div className="mt-16 mx-auto max-w-lg px-4 md:px-0 text-left">
          <p className="text-sm md:text-base text-[#999] leading-relaxed">
            <span className="font-semibold text-white">P.S.</span> — If you&apos;re still
            reading, you&apos;re probably the kind of founder who&apos;s careful about new tools.
            Good. Here&apos;s what I&apos;d do: run the free scan. It takes 90 seconds
            and shows you real dollar amounts with real customer names. If it finds nothing,
            you wasted 90 seconds. If it finds $2,000/month you&apos;re not collecting — and it
            probably will — you&apos;ll know exactly where to go in Stripe to fix it.
            No commitment. No credit card. No catch.
          </p>
          <p className="mt-4 text-sm md:text-base text-[#999] leading-relaxed">
            <span className="font-semibold text-white">P.P.S.</span> — We only scan
            Stripe. If you&apos;re on Chargebee or Paddle, this isn&apos;t for you yet. But if
            your SaaS runs on Stripe and you&apos;re doing $30K–$500K MRR, I&apos;d bet money
            (literally — that&apos;s our $1,000/mo guarantee) that you have leaks right now.
          </p>
        </div>
      </div>
    </section>
  );
}
