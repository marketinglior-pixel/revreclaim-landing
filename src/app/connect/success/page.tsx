"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const account = searchParams.get("account");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-6">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white">RevReclaim</span>
      </div>

      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#10B981]/30 bg-[#10B981]/10">
          <svg className="h-10 w-10 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-white">
          Stripe connected!
        </h1>
        <p className="mb-2 text-lg text-[#999]">
          We&apos;re analyzing your account now.
        </p>
        <p className="mb-8 text-sm text-[#666]">
          Your personalized leak report will be delivered within 24 hours.
          We&apos;ll email you when it&apos;s ready.
        </p>

        {account && (
          <div className="mb-8 rounded-xl border border-[#2A2A2A] bg-[#111] p-4">
            <div className="text-xs text-[#666]">Connected account</div>
            <div className="mt-1 font-mono text-sm text-white">{account}</div>
          </div>
        )}

        {/* What happens next */}
        <div className="mb-8 rounded-xl border border-[#2A2A2A] bg-[#111] p-6 text-left">
          <h2 className="mb-4 text-sm font-semibold text-white">What happens next</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-xs font-bold text-[#10B981]">1</div>
              <div>
                <div className="text-sm text-white">We scan your subscriptions &amp; pricing</div>
                <div className="text-xs text-[#666]">Read-only. Checking discounts, overages, plan versions.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-xs font-bold text-[#10B981]">2</div>
              <div>
                <div className="text-sm text-white">We build your leak report</div>
                <div className="text-xs text-[#666]">Exact customers, amounts, and step-by-step fixes.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-xs font-bold text-[#10B981]">3</div>
              <div>
                <div className="text-sm text-white">We email you the report</div>
                <div className="text-xs text-[#666]">Within 24 hours. Optional walkthrough call included.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust reminder */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm text-[#666]">
          <svg className="h-4 w-4 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span>You can disconnect anytime from your Stripe dashboard settings.</span>
        </div>

        <a
          href="/"
          className="inline-block rounded-xl bg-[#10B981] px-8 py-4 text-sm font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          Back to RevReclaim
        </a>
      </div>
    </div>
  );
}

export default function ConnectSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
          <div className="text-[#666]">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
