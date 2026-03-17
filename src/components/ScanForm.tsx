"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScanReport, ScanStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import ApiKeyInstructions from "./ApiKeyInstructions";
import Link from "next/link";
import type { BillingPlatform } from "@/lib/platforms/types";
import { PLATFORM_LABELS } from "@/lib/platforms/types";
import { trackScanStarted, trackScanCompleted } from "@/lib/conversion-tracking";
import { getUTMParams } from "@/lib/utm";

// OAuth disabled — Stripe Connect requires US business entity (live mode).
// Backend routes kept in /api/auth/stripe/* for future use.
// const STRIPE_OAUTH_AVAILABLE = !!process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID;

const SCAN_STEPS = [
  "Validating API key...",
  "Fetching subscriptions...",
  "Fetching prices and coupons...",
  "Fetching payment methods...",
  "Analyzing subscriptions...",
  "Building report...",
  "Scan complete!",
];

export default function ScanForm() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [platform, setPlatform] = useState<BillingPlatform>("stripe");
  const [scanStatus, setScanStatus] = useState<ScanStatus>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [scanWarnings, setScanWarnings] = useState<string[]>([]);
  // const [showApiKeyFallback, setShowApiKeyFallback] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey) {
      setScanStatus({
        status: "error",
        message: `Please enter your ${PLATFORM_LABELS[platform]} API key.`,
      });
      return;
    }

    // Start scan — fire conversion events
    trackScanStarted(platform);
    setScanStatus({ status: "validating" });
    abortRef.current = new AbortController();

    // Simulate progress steps while waiting for API
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
        body: JSON.stringify({ email: userEmail || "guest@scan.revreclaim.com", apiKey, platform, utm: getUTMParams() }),
        signal: abortRef.current.signal,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        setScanStatus({
          status: "error",
          message: data.error || "Scan failed. Please try again.",
        });
        return;
      }

      // Capture server-side warnings (e.g., write-key used)
      if (data.warnings?.length) {
        setScanWarnings(data.warnings);
      }

      const report: ScanReport = data.report;

      // Fire scan_completed conversion events (GA4 + Meta)
      trackScanCompleted(
        report.leaks?.length ?? 0,
        report.summary?.mrrAtRisk ?? 0
      );

      setScanStatus({
        status: "scanning",
        step: "Scan complete!",
        progress: 100,
      });

      // Store report in sessionStorage
      sessionStorage.setItem(`report_${report.id}`, JSON.stringify(report));

      // Short delay so user sees 100%
      await new Promise((resolve) => setTimeout(resolve, 800));

      setScanStatus({ status: "complete", report });

      // Navigate to report
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
    }
  };

  const isScanning =
    scanStatus.status === "validating" || scanStatus.status === "scanning";

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Logged-in banner */}
      {isLoggedIn && userEmail && (
        <div className="mb-4 rounded-lg bg-brand/10 border border-brand/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-brand">
              Signed in as <span className="font-medium">{userEmail}</span>
            </span>
          </div>
          <Link href="/dashboard" className="text-xs text-brand hover:text-brand-light transition">
            Dashboard →
          </Link>
        </div>
      )}

      {/* Not logged in — encourage signup */}
      {!isLoggedIn && (
        <div className="mb-4 rounded-lg bg-surface border border-border px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-text-muted">
            <Link href="/auth/signup" className="text-brand hover:text-brand-light transition font-medium">
              Create a free account
            </Link>
            {" "}to save your reports permanently.
          </span>
        </div>
      )}

      <form onSubmit={handleScan} className="space-y-4">
        {/* Platform selector */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Billing Platform
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["stripe", "polar", "paddle"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setPlatform(p); setApiKey(""); }}
                disabled={isScanning}
                className={`py-2.5 text-sm font-medium rounded-lg border transition cursor-pointer disabled:opacity-50 ${
                  platform === p
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-surface text-text-muted hover:border-border hover:text-white"
                }`}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* API Key input */}
        <div className="space-y-4">
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
                platform === "stripe" ? "rk_live_..." :
                platform === "polar" ? "polar_oat_..." :
                "Your API key..."
              }
              disabled={isScanning}
              className="w-full px-4 py-3 pr-12 bg-surface border border-border rounded-lg text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition font-mono text-sm disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition"
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

        {/* Write-key warning — Stripe secret keys have full write access */}
        {platform === "stripe" && apiKey.startsWith("sk_") && (
          <div className="rounded-lg bg-warning/10 border border-warning/30 px-4 py-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-warning">This is a secret key with full write access</p>
                <p className="text-xs text-text-muted mt-1">
                  We only need read access. For maximum security, use a{" "}
                  <strong className="text-white">restricted key</strong> (starts with <code className="text-brand">rk_live_</code>).
                  {" "}Follow the instructions below to create one. Your scan will still work with this key, but we strongly recommend switching.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Key Instructions */}
        <ApiKeyInstructions platform={platform} />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isScanning}
          className="w-full py-3 bg-brand text-sm font-bold text-black rounded-lg min-h-[44px] transition-all hover:bg-brand-dark hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isScanning ? "Scanning..." : "Start My Free Audit →"}
        </button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Read-only access
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Key never stored
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Under 90 sec
          </span>
        </div>
        <div className="text-center mt-2">
          <Link
            href="/security"
            className="text-xs text-brand hover:text-brand-light underline underline-offset-2 transition"
          >
            How we protect your data &rarr;
          </Link>
        </div>
      </form>

      {/* Progress indicator */}
      {isScanning && (
        <div className="mt-6 bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-white font-medium">
              {scanStatus.status === "scanning"
                ? scanStatus.step
                : "Validating API key..."}
            </p>
          </div>
          <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${scanStatus.status === "scanning" ? scanStatus.progress : 5}%`,
              }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            This usually takes 30-90 seconds depending on your account size.
          </p>
        </div>
      )}

      {/* Key rotation reminder (shown after scan with warnings) */}
      {scanWarnings.length > 0 && !isScanning && (
        <div className="mt-4 bg-warning/10 border border-warning/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <div>
              <p className="text-sm text-warning font-medium">Rotate your API key</p>
              <p className="text-xs text-text-muted mt-1">
                {scanWarnings[0]} After scanning, delete or rotate the key you used for maximum security.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {scanStatus.status === "error" && (
        <div className="mt-4 bg-danger/10 border border-danger/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-danger flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-sm text-danger font-medium">Scan Failed</p>
              <p className="text-xs text-text-muted mt-1">{scanStatus.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
