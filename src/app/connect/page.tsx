"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConnectContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [email, setEmail] = useState("");

  const errorMessages: Record<string, string> = {
    access_denied: "Stripe access was denied. You can try again anytime.",
    no_code: "Something went wrong with the Stripe connection. Please try again.",
    token_failed: "Could not complete the Stripe connection. Please try again.",
    server_error: "Server error. Please try again or contact support.",
  };

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

      <div className="w-full max-w-md">
        <h1 className="mb-3 text-center text-3xl font-bold text-white">
          Connect your Stripe
        </h1>
        <p className="mb-8 text-center text-[#999]">
          Read-only access. We never modify your billing, see credit card
          numbers, or touch customer data. We only read subscription and
          pricing metadata.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-4 text-center text-sm text-[#EF4444]">
            {errorMessages[error] || "Something went wrong. Please try again."}
          </div>
        )}

        {/* Email input for tracking */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-[#666]">
            Your email (so we can send your report)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="founder@yoursaas.com"
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#111] px-5 py-4 text-sm text-white placeholder-[#666] outline-none transition-colors focus:border-[#10B981]/50"
          />
        </div>

        {/* Connect button */}
        <a
          href={`/api/stripe/authorize${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#635BFF] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#7A73FF] hover:shadow-[0_0_20px_rgba(99,91,255,0.3)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
          </svg>
          Connect Stripe Account
        </a>

        {/* Trust signals */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 text-sm text-[#666]">
            <svg className="h-5 w-5 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Read-only access - we can never modify your billing</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#666]">
            <svg className="h-5 w-5 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>No credit card numbers, no customer PII accessed</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#666]">
            <svg className="h-5 w-5 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Your leak report will be ready within 24 hours</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#666]">
            <svg className="h-5 w-5 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Disconnect anytime from your Stripe dashboard</span>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-[#666] transition-colors hover:text-white">
            &larr; Back to revreclaim.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
          <div className="text-[#666]">Loading...</div>
        </div>
      }
    >
      <ConnectContent />
    </Suspense>
  );
}
