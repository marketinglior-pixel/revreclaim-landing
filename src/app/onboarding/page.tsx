"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { BillingPlatform } from "@/lib/platforms/types";
import { PLATFORM_LABELS } from "@/lib/platforms/types";
import { ScanReport, ScanStatus } from "@/lib/types";
import ApiKeyInstructions from "@/components/ApiKeyInstructions";
import { PageViewTracker } from "@/components/PageViewTracker";
import { trackScanStarted, trackScanCompleted } from "@/lib/conversion-tracking";
import { getUTMParams } from "@/lib/utm";

const SCAN_STEPS = [
  "Validating API key...",
  "Fetching subscriptions...",
  "Fetching prices and coupons...",
  "Fetching payment methods...",
  "Analyzing subscriptions...",
  "Building report...",
  "Scan complete!",
];

export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnboardingPage />
    </Suspense>
  );
}

function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<BillingPlatform | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [email, setEmail] = useState("");
  const [scanStatus, setScanStatus] = useState<ScanStatus>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const [scanWarnings, setScanWarnings] = useState<string[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  // Auto-fill email from session (guest scanning allowed)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
      } else {
        // Guest mode — scan without signup
        setEmail("guest@scan.revreclaim.com");
      }
    });
  }, []);

  // Handle error from query params (e.g. failed OAuth redirect, kept for backwards compat)
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setScanError(error);
      setPlatform("stripe");
      setStep(2);
    }
  }, [searchParams]);

  const handleScan = async () => {
    if (!platform || !apiKey || !email) return;

    trackScanStarted(platform);
    setScanStatus({ status: "validating" });
    setStep(3);
    abortRef.current = new AbortController();

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < SCAN_STEPS.length - 2) {
        currentStep++;
        setScanStatus({
          status: "scanning",
          step: SCAN_STEPS[currentStep],
          progress: Math.min(85, (currentStep / SCAN_STEPS.length) * 100),
        });
      }
    }, 3000);

    try {
      setScanStatus({
        status: "scanning",
        step: SCAN_STEPS[0],
        progress: 5,
      });

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, apiKey, platform, utm: getUTMParams() }),
        signal: abortRef.current.signal,
      });

      clearInterval(progressInterval);
      const data = await response.json();

      if (!response.ok) {
        setScanStatus({
          status: "error",
          message: data.error || "Scan failed. Please try again.",
        });
        setStep(2);
        return;
      }

      if (data.warnings?.length) {
        setScanWarnings(data.warnings);
      }

      const report: ScanReport = data.report;
      trackScanCompleted(report.leaks?.length ?? 0, report.summary?.mrrAtRisk ?? 0);

      setScanStatus({
        status: "scanning",
        step: "Scan complete!",
        progress: 100,
      });

      sessionStorage.setItem(`report_${report.id}`, JSON.stringify(report));

      await new Promise((resolve) => setTimeout(resolve, 800));
      setScanStatus({ status: "complete", report });
      router.push(`/report/${report.id}`);
    } catch (error) {
      clearInterval(progressInterval);
      if (error instanceof DOMException && error.name === "AbortError") {
        setScanStatus({ status: "idle" });
        return;
      }
      setScanStatus({
        status: "error",
        message: "Connection failed. Please check your internet and try again.",
      });
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dim">
      <PageViewTracker page="onboarding" />

      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            RevReclaim
          </Link>
          {email && email !== "guest@scan.revreclaim.com" ? (
            <Link href="/dashboard" className="text-sm text-text-muted hover:text-white transition">
              Skip to dashboard &rarr;
            </Link>
          ) : (
            <Link href="/auth/signup" className="text-sm text-text-muted hover:text-white transition">
              Create account &rarr;
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? "bg-brand text-black"
                      : "bg-surface-light text-text-muted"
                  }`}
                >
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                <span className={`text-xs hidden sm:block ${step >= s ? "text-white" : "text-text-muted"}`}>
                  {s === 1 ? "Platform" : s === 2 ? "API Key" : "Scanning"}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-surface-light rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome + Platform selection */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Let&apos;s find your billing leaks.
              </h1>
              <p className="text-text-muted max-w-md mx-auto">
                Most SaaS companies have 3-8% of their MRR leaking through billing gaps
                they can&apos;t see. This takes 90 seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <label className="block text-sm font-semibold text-white mb-4">
                Which billing platform do you use?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["stripe", "polar", "paddle"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-4 text-sm font-medium rounded-xl border-2 transition cursor-pointer ${
                      platform === p
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border bg-surface-dim text-text-muted hover:border-border hover:text-white"
                    }`}
                  >
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => platform && setStep(2)}
                disabled={!platform}
                className="w-full mt-6 py-3 bg-brand text-sm font-bold text-black rounded-lg min-h-[44px] transition-all hover:bg-brand-dark disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
              </button>
            </div>

            {/* Problem reminder — keep them motivated */}
            <div className="mt-6 rounded-xl border border-border-light bg-surface-dim p-4">
              <p className="text-xs text-text-muted text-center">
                The average scan finds <span className="text-white font-semibold">$2,340/month</span> in
                leaked revenue. Expired coupons, failed payments, and pricing gaps that
                your dashboard doesn&apos;t surface.
              </p>
            </div>

            {/* Demo escape hatch */}
            <div className="mt-4 text-center">
              <Link href="/demo" className="text-sm text-text-muted hover:text-brand transition">
                Not ready? See a demo report first &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: API Key input */}
        {step === 2 && platform && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Paste your {PLATFORM_LABELS[platform]} API key.
              </h1>
              <p className="text-text-muted max-w-md mx-auto">
                Read-only access. We can&apos;t change anything in your account.
                The key is deleted the moment the scan finishes.
              </p>
              {/* Direct link to platform dashboard */}
              <div className="mt-3">
                {platform === "stripe" && (
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-light transition">
                    Open Stripe Dashboard to copy your key
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                {platform === "polar" && (
                  <a href="https://polar.sh/settings" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-light transition">
                    Open Polar Settings to copy your token
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                {platform === "paddle" && (
                  <a href="https://vendors.paddle.com/authentication" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-light transition">
                    Open Paddle Dashboard to copy your key
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* OAuth error (from failed OAuth redirect) */}
            {scanError && (
              <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3">
                <p className="text-sm text-danger">{scanError}</p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  {platform === "stripe" ? "Stripe Restricted API Key" :
                   platform === "polar" ? "Polar Organization Access Token" :
                   "Paddle API Key"}
                </label>
                <div className="relative">
                  <input
                    id="apiKey"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      platform === "stripe" ? "rk_live_... or sk_live_..." :
                      platform === "polar" ? "polar_oat_..." :
                      "Your API key..."
                    }
                    autoFocus
                    className="w-full px-4 py-3 pr-12 bg-surface-dim border border-border rounded-lg text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition cursor-pointer"
                  >
                    {showKey ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Secret key info */}
              {platform === "stripe" && apiKey.startsWith("sk_") && (
                <div className="rounded-lg bg-brand/5 border border-brand/20 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-brand">This key works. We&apos;ll only read your data.</p>
                      <p className="text-xs text-text-muted mt-1">
                        Tip: for extra security next time, use a{" "}
                        <strong className="text-white">restricted key</strong> (<code className="text-brand">rk_live_</code>).
                        We delete your key immediately after the scan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <ApiKeyInstructions platform={platform} />

              {/* Error message */}
              {scanStatus.status === "error" && (
                <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3">
                  <p className="text-sm text-danger">{scanStatus.message}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(1); setApiKey(""); setScanError(null); }}
                  className="px-4 py-3 border border-border bg-surface-dim text-sm text-text-muted rounded-lg transition hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleScan}
                  disabled={!apiKey}
                  className="flex-1 py-3 bg-brand text-sm font-bold text-black rounded-lg min-h-[44px] transition-all hover:bg-brand-dark disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Scan My Account
                </button>
              </div>

              {/* Security line */}
              <div className="flex items-center justify-center gap-4 text-xs text-text-muted pt-2">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Read-only
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Key deleted after scan
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Scanning */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Scanning for leaks...
              </h1>
              <p className="text-text-muted max-w-md mx-auto">
                Checking your subscriptions, invoices, coupons, payment methods, and pricing.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-8">
              {/* Scanning animation */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-surface-light" />
                  <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                </div>

                <p className="text-sm text-white font-medium">
                  {scanStatus.status === "scanning"
                    ? scanStatus.step
                    : "Validating API key..."}
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-xs">
                  <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${scanStatus.status === "scanning" ? scanStatus.progress : 5}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-2 text-center">
                    Usually takes 30-90 seconds
                  </p>
                </div>

                {/* What we're checking */}
                <div className="w-full grid grid-cols-2 gap-2 mt-2">
                  {[
                    "Expired coupons",
                    "Failed payments",
                    "Legacy pricing",
                    "Expiring cards",
                    "Ghost subscriptions",
                    "Missing payment methods",
                  ].map((check, i) => (
                    <div key={check} className="flex items-center gap-2 text-xs text-text-muted">
                      {scanStatus.status === "scanning" &&
                       scanStatus.progress !== undefined &&
                       scanStatus.progress > (i + 1) * 12 ? (
                        <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                      )}
                      {check}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key rotation reminder */}
            {scanWarnings.length > 0 && (
              <div className="mt-4 bg-warning/10 border border-warning/20 rounded-xl p-4">
                <p className="text-sm text-warning font-medium">Rotate your API key</p>
                <p className="text-xs text-text-muted mt-1">{scanWarnings[0]}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
