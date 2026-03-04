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

        <h2 className="relative mb-4 text-3xl font-bold text-white md:text-5xl">
          Stop leaving money on the table
        </h2>
        <p className="relative mb-10 text-lg text-[#999]">
          Every month you wait is another month of leaked revenue.
          <br />
          Get your free audit report and see what you&apos;re missing.
        </p>

        {/* Email capture form */}
        <div className="relative mx-auto max-w-md">
          {status === "success" ? (
            <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-6">
              <svg className="mx-auto mb-3 h-8 w-8 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-[#10B981]">You&apos;re in!</p>
              <p className="mt-1 text-xs text-[#999]">We&apos;ll email you within 24 hours with simple instructions to start your free audit.</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#666]">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Read-only access
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Report in 24hrs
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@yoursaas.com"
                  required
                  className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#111] px-5 py-4 text-sm text-white placeholder-[#666] outline-none transition-colors focus:border-[#10B981]/50"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-xl bg-[#10B981] px-8 py-4 text-sm font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  {status === "loading" ? "Sending..." : "Get Free Audit"}
                </button>
              </div>
              {status === "error" && (
                <p className="mt-2 text-xs text-[#EF4444]">Something went wrong. Please try again.</p>
              )}
              <p className="mt-3 text-xs text-[#666]">
                No credit card required. Read-only Stripe access. Cancel anytime.
              </p>
            </form>
          )}
        </div>

        {/* Guarantee badge */}
        <div className="mt-12 inline-flex items-center gap-3 rounded-xl border border-[#2A2A2A] bg-[#111] px-6 py-4">
          <svg className="h-8 w-8 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">$1,000/mo Guarantee</div>
            <div className="text-xs text-[#666]">For accounts with $30K+ MRR. If we don&apos;t find $1,000/mo in leaks, you pay nothing</div>
          </div>
        </div>
      </div>
    </section>
  );
}
