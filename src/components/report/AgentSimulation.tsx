"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ACTION_TYPE_LABELS } from "@/lib/recovery/types";
import type { ActionType } from "@/lib/recovery/types";
import type { Leak } from "@/lib/types";

// ────────────────────────────────────────────────────────
// Recovery Agent Simulation
// Shows agents fixing leaks in real-time to demo paid features
// ────────────────────────────────────────────────────────

type SimStatus = "pending" | "approved" | "executing" | "executed";

interface SimEvent {
  id: string;
  actionType: ActionType;
  label: string;
  customerEmail: string;
  monthlyImpact: number; // cents
  status: SimStatus;
}

/** Which leaks to simulate and what action to take */
const SIMULATION_PLAN: { leakIndex: number; actionType: ActionType }[] = [
  { leakIndex: 0, actionType: "send_dunning_email" },
  { leakIndex: 2, actionType: "send_dunning_email" },
  { leakIndex: 10, actionType: "remove_coupon" },
  { leakIndex: 6, actionType: "cancel_subscription" },
  { leakIndex: 14, actionType: "send_dunning_email" },
  { leakIndex: 11, actionType: "remove_coupon" },
  { leakIndex: 1, actionType: "send_dunning_email" },
  { leakIndex: 8, actionType: "cancel_subscription" },
];

function buildSimEvents(leaks: Leak[]): SimEvent[] {
  return SIMULATION_PLAN.map((plan, idx) => {
    const leak = leaks[plan.leakIndex];
    if (!leak) return null;
    return {
      id: `sim-${idx}`,
      actionType: plan.actionType,
      label: ACTION_TYPE_LABELS[plan.actionType],
      customerEmail: leak.customerEmail || "customer@masked.com",
      monthlyImpact: leak.monthlyImpact,
      status: "pending" as SimStatus,
    };
  }).filter(Boolean) as SimEvent[];
}

// ── Status badge config ──

const STATUS_CONFIG: Record<
  SimStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Queued",
    className: "bg-warning/15 text-warning border-warning/25",
  },
  approved: {
    label: "Approved",
    className: "bg-info/15 text-info border-info/25",
  },
  executing: {
    label: "Executing",
    className: "bg-purple/15 text-purple border-purple/25",
  },
  executed: {
    label: "Recovered",
    className: "bg-brand/15 text-brand border-brand/25",
  },
};

// ── Event Row ──

function SimEventRow({
  event,
  isLatest,
}: {
  event: SimEvent;
  isLatest: boolean;
}) {
  const config = STATUS_CONFIG[event.status];
  const impact = Math.round(event.monthlyImpact / 100);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
        isLatest && event.status !== "executed"
          ? "bg-surface-light/50"
          : event.status === "executed"
            ? "bg-brand/5"
            : "bg-transparent"
      } ${isLatest ? "animate-fade-in-up" : ""}`}
    >
      {/* Status icon */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {event.status === "executing" ? (
          <span className="h-4 w-4 border-2 border-purple border-t-transparent rounded-full animate-spin" />
        ) : event.status === "executed" ? (
          <svg
            className="h-4 w-4 text-brand"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : event.status === "approved" ? (
          <svg
            className="h-4 w-4 text-info"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>

      {/* Action label */}
      <span className="text-xs font-medium text-white truncate flex-1 min-w-0">
        {event.label}
      </span>

      {/* Customer email — hidden on mobile */}
      <span className="text-[11px] font-mono text-text-dim hidden sm:block truncate max-w-[160px]">
        {event.customerEmail}
      </span>

      {/* Status badge */}
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-all duration-300 ${config.className}`}
      >
        {config.label}
      </span>

      {/* Impact */}
      <span
        className={`text-xs font-bold tabular-nums min-w-[70px] text-right transition-colors duration-300 ${
          event.status === "executed" ? "text-brand" : "text-text-muted"
        }`}
      >
        +${impact.toLocaleString()}/mo
      </span>
    </div>
  );
}

// ── Main Component ──

export default function AgentSimulation({ leaks }: { leaks: Leak[] }) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [recoveredCents, setRecoveredCents] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const simEvents = buildSimEvents(leaks);
  const allSimEvents = useRef(simEvents);
  const totalRecovery = useRef(
    simEvents.reduce((sum, e) => sum + e.monthlyImpact, 0)
  );

  // Reduced motion: show final state immediately
  useEffect(() => {
    if (prefersReducedMotion) {
      setEvents(
        allSimEvents.current.map((e) => ({ ...e, status: "executed" as SimStatus }))
      );
      setRecoveredCents(totalRecovery.current);
      setIsComplete(true);
      setHasStarted(true);
    }
  }, [prefersReducedMotion]);

  // Intersection Observer: auto-start when 30% visible
  useEffect(() => {
    if (hasStarted || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasStarted, prefersReducedMotion]);

  // Animation engine
  useEffect(() => {
    if (!hasStarted || prefersReducedMotion) return;

    const simEvents = allSimEvents.current;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const EVENT_GAP = 1200;
    const STATUS_STEPS: { status: SimStatus; delay: number }[] = [
      { status: "pending", delay: 0 },
      { status: "approved", delay: 300 },
      { status: "executing", delay: 600 },
      { status: "executed", delay: 900 },
    ];

    simEvents.forEach((event, eventIdx) => {
      STATUS_STEPS.forEach((step) => {
        const totalDelay = eventIdx * EVENT_GAP + step.delay;

        const timeout = setTimeout(() => {
          setEvents((prev) => {
            const updated = [...prev];
            const existing = updated.findIndex((e) => e.id === event.id);
            if (existing >= 0) {
              updated[existing] = { ...updated[existing], status: step.status };
            } else {
              updated.push({ ...event, status: step.status });
            }
            return updated;
          });

          if (step.status === "executed") {
            setRecoveredCents((prev) => prev + event.monthlyImpact);
          }
        }, totalDelay);

        timeouts.push(timeout);
      });
    });

    // Show CTA after all events complete
    const ctaDelay = simEvents.length * EVENT_GAP + 900 + 500;
    timeouts.push(setTimeout(() => setIsComplete(true), ctaDelay));

    return () => timeouts.forEach(clearTimeout);
  }, [hasStarted, prefersReducedMotion]);

  // Auto-scroll feed to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [events]);

  const recoveredDollars = Math.round(recoveredCents / 100);

  return (
    <div ref={containerRef}>
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        {/* Header: title + live recovery counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`h-2 w-2 rounded-full ${
                  isComplete
                    ? "bg-brand"
                    : hasStarted
                      ? "bg-brand animate-pulse"
                      : "bg-text-dim"
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                {isComplete
                  ? "Simulation Complete"
                  : hasStarted
                    ? "Recovery Agents Active"
                    : "Recovery Agent Preview"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              What happens after the scan
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Watch our agents automatically fix revenue leaks from your report
            </p>
          </div>

          {/* Live recovery counter */}
          <div className="bg-surface-dim border border-brand/20 rounded-xl px-5 py-3 text-right min-w-[180px]">
            <p className="text-[10px] uppercase tracking-wider text-text-dim mb-0.5">
              Recovered
            </p>
            <p className="text-2xl font-bold tabular-nums transition-all duration-500">
              <span className="text-brand">
                ${recoveredDollars.toLocaleString()}
              </span>
              <span className="text-sm font-normal text-text-muted">/mo</span>
            </p>
          </div>
        </div>

        {/* Terminal-style event feed */}
        <div
          ref={feedRef}
          className="bg-surface-dim border border-border rounded-xl overflow-hidden max-h-[420px] overflow-y-auto"
        >
          {/* Terminal header bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-border sticky top-0 z-10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-brand/60" />
            </div>
            <span className="text-[11px] font-mono text-text-dim ml-2">
              revreclaim-agent &mdash; recovery-queue
            </span>
          </div>

          {/* Event rows */}
          <div className="p-3 space-y-1.5">
            {events.map((event, idx) => (
              <SimEventRow
                key={event.id}
                event={event}
                isLatest={idx === events.length - 1}
              />
            ))}

            {/* Placeholder before animation starts */}
            {!hasStarted && (
              <div className="flex items-center justify-center py-8 text-text-dim text-xs">
                <span className="font-mono">
                  Waiting to initialize agents...
                </span>
              </div>
            )}

            {/* Cursor while running */}
            {hasStarted && !isComplete && (
              <div className="flex items-center gap-2 px-3 py-2 text-text-dim">
                <span className="inline-block w-1.5 h-4 bg-brand/60 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Completion CTA */}
        {isComplete && (
          <div className="mt-6 animate-fade-in-up">
            <div className="bg-gradient-to-br from-brand/10 to-transparent border border-brand/20 rounded-xl p-6 text-center">
              <p className="text-lg font-bold text-white mb-2">
                ${recoveredDollars.toLocaleString()}/mo recovered in 10 seconds
              </p>
              <p className="text-sm text-text-muted max-w-lg mx-auto mb-5">
                These agents run automatically on your account. Fixing failed
                payments, removing expired coupons, and cleaning up ghost
                subscriptions. No manual work.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/#pricing"
                  className="px-6 py-3 bg-brand hover:bg-brand-light text-black font-bold rounded-lg transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  Activate Recovery Agents
                </Link>
                <Link
                  href="/scan"
                  className="px-6 py-3 bg-surface-light hover:bg-surface-lighter text-white font-medium rounded-lg border border-border transition-all"
                >
                  Scan Your Account First
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
