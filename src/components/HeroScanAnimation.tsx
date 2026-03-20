"use client";

import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ────────────────────────────────────────────────────────
// Hero Scan Animation
// Terminal-style animation showing the 10 scanner types
// running in sequence — demonstrates the product in the Hero
// ────────────────────────────────────────────────────────

type ScanStatus = "waiting" | "scanning" | "done";

interface ScanStep {
  id: string;
  label: string;
  leaksFound: number;
  impactCents: number;
  status: ScanStatus;
}

const SCAN_STEPS: Omit<ScanStep, "status">[] = [
  { id: "connect", label: "Connecting to Stripe API", leaksFound: 0, impactCents: 0 },
  { id: "load", label: "Loading subscriptions (847)", leaksFound: 0, impactCents: 0 },
  { id: "s1", label: "Scanning expired coupons", leaksFound: 3, impactCents: 29700 },
  { id: "s2", label: "Scanning failed payments", leaksFound: 5, impactCents: 89900 },
  { id: "s3", label: "Scanning legacy pricing", leaksFound: 2, impactCents: 34900 },
  { id: "s4", label: "Scanning expiring cards", leaksFound: 4, impactCents: 24900 },
  { id: "s5", label: "Scanning ghost subscriptions", leaksFound: 3, impactCents: 19900 },
  { id: "s6", label: "Scanning never-expiring discounts", leaksFound: 2, impactCents: 14900 },
  { id: "s7", label: "Scanning missing payment methods", leaksFound: 1, impactCents: 9900 },
  { id: "s8", label: "Scanning duplicate subscriptions", leaksFound: 1, impactCents: 4900 },
  { id: "s9", label: "Scanning trial expirations", leaksFound: 1, impactCents: 3900 },
  { id: "s10", label: "Scanning unbilled overages", leaksFound: 1, impactCents: 1100 },
];

const TOTAL_LEAKS = SCAN_STEPS.reduce((s, step) => s + step.leaksFound, 0);
const TOTAL_IMPACT = SCAN_STEPS.reduce((s, step) => s + step.impactCents, 0);

function StatusIcon({ status }: { status: ScanStatus }) {
  if (status === "scanning") {
    return (
      <span className="h-3.5 w-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    );
  }
  if (status === "done") {
    return (
      <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  return (
    <span className="h-3.5 w-3.5 rounded-full border border-white/10" />
  );
}

function ScanRow({ step, isLatest }: { step: ScanStep; isLatest: boolean }) {
  const impact = Math.round(step.impactCents / 100);
  const isScanner = step.id.startsWith("s");

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg transition-all duration-500 ${
        isLatest && step.status === "scanning"
          ? "bg-brand/[0.07] shadow-[inset_0_0_20px_rgba(16,185,129,0.03)]"
          : step.status === "done" && isScanner && step.leaksFound > 0
            ? "bg-white/[0.02]"
            : ""
      } ${isLatest ? "animate-fade-in-up" : ""}`}
    >
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        <StatusIcon status={step.status} />
      </div>

      <span className={`text-xs font-medium truncate flex-1 min-w-0 transition-colors duration-500 font-mono ${
        step.status === "scanning" ? "text-white" : step.status === "done" ? "text-white/50" : "text-white/30"
      }`}>
        {step.label}
      </span>

      {step.status === "done" && isScanner && (
        <span className={`text-[11px] font-bold tabular-nums whitespace-nowrap transition-all duration-500 ${
          step.leaksFound > 0 ? "text-brand" : "text-white/20"
        }`}>
          {step.leaksFound > 0
            ? `${step.leaksFound} found · +$${impact}/mo`
            : "Clean"}
        </span>
      )}

      {step.status === "done" && !isScanner && (
        <span className="text-[11px] font-medium text-white/25 whitespace-nowrap font-mono">
          OK
        </span>
      )}

      {step.status === "scanning" && (
        <span className="text-[11px] font-medium text-brand whitespace-nowrap animate-pulse font-mono">
          running...
        </span>
      )}
    </div>
  );
}

export function HeroScanAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const feedRef = useRef<HTMLDivElement>(null);

  const [steps, setSteps] = useState<ScanStep[]>(() =>
    prefersReducedMotion ? SCAN_STEPS.map((s) => ({ ...s, status: "done" as ScanStatus })) : []
  );
  const [leakCount, setLeakCount] = useState(() => (prefersReducedMotion ? TOTAL_LEAKS : 0));
  const [impactCents, setImpactCents] = useState(() => (prefersReducedMotion ? TOTAL_IMPACT : 0));
  const [isComplete, setIsComplete] = useState(prefersReducedMotion);
  const [hasStarted, setHasStarted] = useState(prefersReducedMotion);

  // Auto-start after a brief delay (hero is always visible)
  useEffect(() => {
    if (prefersReducedMotion) return;
    const startDelay = setTimeout(() => setHasStarted(true), 800);
    return () => clearTimeout(startDelay);
  }, [prefersReducedMotion]);

  // Animation engine
  useEffect(() => {
    if (!hasStarted || prefersReducedMotion) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const STEP_GAP = 700;

    SCAN_STEPS.forEach((step, idx) => {
      const scanDelay = idx * STEP_GAP;
      timeouts.push(
        setTimeout(() => {
          setSteps((prev) => [...prev, { ...step, status: "scanning" }]);
        }, scanDelay)
      );

      const doneDelay = scanDelay + 450;
      timeouts.push(
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s) => (s.id === step.id ? { ...s, status: "done" } : s))
          );
          if (step.leaksFound > 0) {
            setLeakCount((prev) => prev + step.leaksFound);
            setImpactCents((prev) => prev + step.impactCents);
          }
        }, doneDelay)
      );
    });

    const completeDelay = SCAN_STEPS.length * STEP_GAP + 600;
    timeouts.push(setTimeout(() => setIsComplete(true), completeDelay));

    return () => timeouts.forEach(clearTimeout);
  }, [hasStarted, prefersReducedMotion]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [steps]);

  const impactDollars = Math.round(impactCents / 100);

  return (
    <div className="w-full">
      {/* Terminal container — glass morphism with green ambient glow */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(16,185,129,0.04)]">
        {/* Browser chrome — refined */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
            </div>
            <span className="text-[11px] font-mono text-white/25 ml-1">
              revreclaim &mdash; billing scan
            </span>
          </div>

          {/* Live counter */}
          {hasStarted && (
            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Leaks</span>
                <p className="text-sm font-bold tabular-nums text-brand leading-none">{leakCount}</p>
              </div>
              <div className="w-px h-6 bg-white/[0.06]" />
              <div>
                <span className="text-[9px] uppercase tracking-widest text-white/25 font-mono">At Risk</span>
                <p className="text-sm font-bold tabular-nums text-brand leading-none">
                  ${impactDollars.toLocaleString()}/mo
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Scan feed */}
        <div ref={feedRef} className="p-3 space-y-0.5 max-h-[340px] overflow-y-auto">
          {steps.map((step, idx) => (
            <ScanRow key={step.id} step={step} isLatest={idx === steps.length - 1} />
          ))}

          {/* Pre-start state */}
          {!hasStarted && (
            <div className="flex items-center justify-center py-12 text-white/20 text-xs">
              <span className="font-mono animate-pulse">Initializing scan...</span>
            </div>
          )}

          {/* Cursor while running */}
          {hasStarted && !isComplete && (
            <div className="flex items-center gap-2 px-3.5 py-2">
              <span className="inline-block w-[3px] h-4 bg-brand/50 animate-pulse rounded-sm" />
            </div>
          )}
        </div>

        {/* Summary bar — dramatic finish */}
        {isComplete && (
          <div className="border-t border-brand/20 bg-gradient-to-r from-brand/[0.08] to-brand/[0.03] px-4 py-3.5 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-xs font-semibold text-brand uppercase tracking-wider font-mono">
                  Scan Complete
                </span>
              </div>
              <span className="text-sm font-bold text-white">
                {leakCount} leaks &middot;{" "}
                <span className="text-brand">${impactDollars.toLocaleString()}/mo</span> at risk
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
