"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScanReport, ScanStatus } from "@/lib/types";
import ApiKeyInstructions from "./ApiKeyInstructions";

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
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setScanStatus({ status: "error", message: "Please enter a valid email." });
      return;
    }

    if (!apiKey) {
      setScanStatus({
        status: "error",
        message: "Please enter your Stripe API key.",
      });
      return;
    }

    // Start scan
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
        body: JSON.stringify({ email, apiKey }),
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

      const report: ScanReport = data.report;

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
      <form onSubmit={handleScan} className="space-y-4">
        {/* Email input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#ccc] mb-1.5"
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={isScanning}
            className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg text-white placeholder-[#666] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition disabled:opacity-50"
          />
        </div>

        {/* API Key input */}
        <div>
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-[#ccc] mb-1.5"
          >
            Stripe Restricted API Key
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="rk_live_..."
              disabled={isScanning}
              className="w-full px-4 py-3 pr-12 bg-[#111111] border border-[#2A2A2A] rounded-lg text-white placeholder-[#666] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition font-mono text-sm disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#999] transition"
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

        {/* API Key Instructions */}
        <ApiKeyInstructions />

        {/* Submit button */}
        <button
          type="submit"
          disabled={isScanning}
          className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
        >
          {isScanning ? "Scanning..." : "Start Free Scan"}
        </button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#666]">
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
            Under 2 min
          </span>
        </div>
      </form>

      {/* Progress indicator */}
      {isScanning && (
        <div className="mt-6 bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-white font-medium">
              {scanStatus.status === "scanning"
                ? scanStatus.step
                : "Validating API key..."}
            </p>
          </div>
          <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${scanStatus.status === "scanning" ? scanStatus.progress : 5}%`,
              }}
            />
          </div>
          <p className="text-xs text-[#666] mt-2">
            This usually takes 30-90 seconds depending on your account size.
          </p>
        </div>
      )}

      {/* Error message */}
      {scanStatus.status === "error" && (
        <div className="mt-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5"
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
              <p className="text-sm text-[#EF4444] font-medium">Scan Failed</p>
              <p className="text-xs text-[#999] mt-1">{scanStatus.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
