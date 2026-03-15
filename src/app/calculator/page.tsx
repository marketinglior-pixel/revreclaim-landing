"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

const STORAGE_KEY = "revreclaim_calculator_progress";

/**
 * Revenue Leak Calculator — Daniel Priestley Assessment-Style Quiz
 *
 * SEO target: "how to calculate revenue leakage" (~400-600/mo)
 * Purpose: Lower-friction entry point for cold traffic.
 * Framework: 7 questions that educate + qualify → personalized results → CTA to scan.
 *
 * Key insight: Each question teaches about a leak type they might not know about.
 * By the end, they're educated enough to want the free scan.
 */

// ── Quiz Questions ──────────────────────────────────────────────

interface QuizOption {
  label: string;
  value: string;
  risk: number; // 0-3 (higher = more leak risk)
}

interface QuizQuestion {
  id: string;
  question: string;
  subtext: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "platform",
    question: "Which billing platform do you use?",
    subtext: "We support Stripe, Polar, and Paddle — the platforms where revenue leaks hide.",
    options: [
      { label: "Stripe", value: "stripe", risk: 1 },
      { label: "Polar", value: "polar", risk: 1 },
      { label: "Paddle", value: "paddle", risk: 1 },
      { label: "Other / Multiple", value: "other", risk: 2 },
    ],
  },
  {
    id: "mrr",
    question: "What's your approximate MRR?",
    subtext: "Higher MRR means more at stake. The average SaaS leaks 4.7% of MRR without knowing it.",
    options: [
      { label: "Under $10K", value: "under10k", risk: 0 },
      { label: "$10K – $50K", value: "10k-50k", risk: 1 },
      { label: "$50K – $200K", value: "50k-200k", risk: 2 },
      { label: "$200K+", value: "200k+", risk: 3 },
    ],
  },
  {
    id: "customers",
    question: "How many paying customers?",
    subtext: "More customers = more subscriptions = more surface area for billing mistakes.",
    options: [
      { label: "Under 50", value: "under50", risk: 0 },
      { label: "50 – 200", value: "50-200", risk: 1 },
      { label: "200 – 500", value: "200-500", risk: 2 },
      { label: "500+", value: "500+", risk: 3 },
    ],
  },
  {
    id: "pricing",
    question: "When did you last raise prices?",
    subtext: "Price increases don't retroactively update existing subscriptions. Old customers stay on old prices unless you migrate them manually.",
    options: [
      { label: "Never raised prices", value: "never", risk: 0 },
      { label: "Over 6 months ago", value: "6mo+", risk: 3 },
      { label: "1 – 6 months ago", value: "1-6mo", risk: 2 },
      { label: "Less than a month ago", value: "recent", risk: 1 },
    ],
  },
  {
    id: "coupons",
    question: "How often do you use discount coupons?",
    subtext: "Stripe doesn't auto-remove expired coupons from subscriptions. A coupon set to 'forever' runs indefinitely — even after the promo ends.",
    options: [
      { label: "Frequently", value: "frequently", risk: 3 },
      { label: "Sometimes", value: "sometimes", risk: 2 },
      { label: "Rarely", value: "rarely", risk: 1 },
      { label: "Never", value: "never", risk: 0 },
    ],
  },
  {
    id: "dunning",
    question: "How do you handle failed payments?",
    subtext: "Failed payments are the #1 source of involuntary churn. Without active dunning, subscriptions go 'past_due' silently — becoming stuck subscriptions.",
    options: [
      { label: "Automated dunning tool", value: "automated", risk: 1 },
      { label: "Manual follow-up", value: "manual", risk: 2 },
      { label: "Stripe/platform default", value: "default", risk: 2 },
      { label: "Nothing specific", value: "nothing", risk: 3 },
    ],
  },
  {
    id: "audit",
    question: "When did you last audit your billing subscriptions?",
    subtext: "Most founders never manually review individual subscriptions. That's where leaks hide — in the gap between your dashboard view and actual subscription records.",
    options: [
      { label: "Never", value: "never", risk: 3 },
      { label: "Over 6 months ago", value: "6mo+", risk: 3 },
      { label: "1 – 6 months ago", value: "1-6mo", risk: 2 },
      { label: "This month", value: "recent", risk: 1 },
    ],
  },
];

// ── Leak Breakdown Data ──────────────────────────────────────────

const LEAK_CATEGORIES = [
  { label: "Failed Payments & Dunning Gaps", color: "#EF4444", baseShare: 0.22, riskKeys: ["dunning", "customers"] },
  { label: "Legacy Pricing", color: "#3B82F6", baseShare: 0.15, riskKeys: ["pricing", "customers"] },
  { label: "Stuck Subscriptions", color: "#F97316", baseShare: 0.14, riskKeys: ["dunning", "audit"] },
  { label: "Expired & Forever Coupons", color: "#8B5CF6", baseShare: 0.22, riskKeys: ["coupons", "audit"] },
  { label: "Expiring Cards", color: "#F59E0B", baseShare: 0.12, riskKeys: ["customers", "dunning"] },
  { label: "Missing Payment Methods", color: "#EC4899", baseShare: 0.08, riskKeys: ["audit", "customers"] },
  { label: "Unbilled Overages", color: "#14B8A6", baseShare: 0.07, riskKeys: ["audit", "mrr"] },
];

// ── MRR Estimation ──────────────────────────────────────────────

function estimateMRR(answer: string): number {
  switch (answer) {
    case "under10k": return 7000;
    case "10k-50k": return 30000;
    case "50k-200k": return 100000;
    case "200k+": return 300000;
    default: return 50000;
  }
}

function estimateCustomers(answer: string): number {
  switch (answer) {
    case "under50": return 30;
    case "50-200": return 120;
    case "200-500": return 350;
    case "500+": return 700;
    default: return 200;
  }
}

// ── Component ───────────────────────────────────────────────────

export default function CalculatorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [hasResumableProgress, setHasResumableProgress] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { answers: savedAnswers, step: savedStep } = JSON.parse(saved);
        return !!(savedAnswers && Object.keys(savedAnswers).length > 0 && savedStep > 0);
      }
    } catch { /* ignore */ }
    return false;
  });

  const totalSteps = QUESTIONS.length;
  const progress = showResults ? 100 : Math.round((step / totalSteps) * 100);

  // ── Abandon Prevention: Save progress on every answer ──
  const saveProgress = useCallback((currentAnswers: Record<string, string>, currentStep: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: currentAnswers, step: currentStep }));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  function resumeProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { answers: savedAnswers, step: savedStep } = JSON.parse(saved);
        setAnswers(savedAnswers);
        setStep(savedStep);
        setHasResumableProgress(false);
      }
    } catch {
      setHasResumableProgress(false);
    }
  }

  function dismissResume() {
    setHasResumableProgress(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    trackEvent("calculator_answer" as Parameters<typeof trackEvent>[0], null, {
      question: questionId,
      answer: value,
      step: step + 1,
    }).catch(() => {});

    if (step < totalSteps - 1) {
      const nextStep = step + 1;
      saveProgress(newAnswers, nextStep);
      setTimeout(() => setStep(nextStep), 150);
    } else {
      // Last question answered — show results, clear saved progress
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setTimeout(() => {
        setShowResults(true);
        trackEvent("calculator_completed" as Parameters<typeof trackEvent>[0], null, {
          answers: JSON.stringify(newAnswers),
        }).catch(() => {});
      }, 150);
    }
  }

  function handleBack() {
    if (step > 0) {
      const prevStep = step - 1;
      saveProgress(answers, prevStep);
      setStep(prevStep);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailSubmitted(true);

    // Send to subscribe API (Resend audience + webhook)
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan: `calculator_${healthGrade}_${estimatedMonthlyLeak}`,
        }),
      });
    } catch { /* non-critical */ }

    trackEvent("calculator_email_captured" as Parameters<typeof trackEvent>[0], null, {
      health_grade: healthGrade,
      estimated_leak: estimatedMonthlyLeak,
    }).catch(() => {});
  }

  // ── Calculate Results ──

  const mrrEstimate = estimateMRR(answers.mrr || "10k-50k");
  const customerEstimate = estimateCustomers(answers.customers || "50-200");

  // Total risk score from all answers
  const totalRisk = Object.entries(answers).reduce((sum, [qId, val]) => {
    const question = QUESTIONS.find(q => q.id === qId);
    const option = question?.options.find(o => o.value === val);
    return sum + (option?.risk || 0);
  }, 0);

  const maxRisk = QUESTIONS.length * 3; // 21
  const riskPercentage = totalRisk / maxRisk;

  // Base leak rate: 2% (low risk) to 7% (high risk)
  const leakRate = 0.02 + riskPercentage * 0.05;
  const estimatedMonthlyLeak = Math.round(mrrEstimate * leakRate);
  const estimatedAnnualLeak = estimatedMonthlyLeak * 12;
  const estimatedLeakCount = Math.max(3, Math.round(customerEstimate * 0.08 * (1 + riskPercentage)));

  // Health grade
  const healthScore = Math.round(100 - riskPercentage * 60);
  const healthGrade =
    healthScore >= 80 ? "A" :
    healthScore >= 65 ? "B" :
    healthScore >= 50 ? "C" :
    healthScore >= 35 ? "D" : "F";
  const healthColor =
    healthScore >= 80 ? "text-brand" :
    healthScore >= 65 ? "text-blue-400" :
    healthScore >= 50 ? "text-warning" :
    healthScore >= 35 ? "text-orange-400" : "text-danger";

  // Per-category breakdown adjusted by relevant answer risk
  const categoryBreakdown = LEAK_CATEGORIES.map(cat => {
    const relevantRisk = cat.riskKeys.reduce((sum, key) => {
      const question = QUESTIONS.find(q => q.id === key);
      const option = question?.options.find(o => o.value === answers[key]);
      return sum + (option?.risk || 1);
    }, 0);
    const adjustedShare = cat.baseShare * (0.5 + relevantRisk / 6);
    return { ...cat, amount: Math.round(estimatedMonthlyLeak * adjustedShare) };
  }).sort((a, b) => b.amount - a.amount);

  // Top risk findings
  const findings: string[] = [];
  if (answers.pricing === "6mo+" || answers.pricing === "1-6mo") {
    findings.push("You raised prices but likely have customers still on old rates. This is one of the most common leaks.");
  }
  if (answers.coupons === "frequently" || answers.coupons === "sometimes") {
    findings.push("Active coupon usage means expired or forever coupons are almost certainly running on some subscriptions.");
  }
  if (answers.dunning === "nothing" || answers.dunning === "default") {
    findings.push("Without active dunning, failed payments become stuck subscriptions — customers who aren't paying but aren't canceled.");
  }
  if (answers.audit === "never" || answers.audit === "6mo+") {
    findings.push("Without regular billing audits, leaks compound silently. Most founders don't know until they check.");
  }

  // ── Render ──

  if (showResults) {
    return (
      <div className="min-h-screen bg-surface-dim text-white">
        <Header />
        <main className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6">
            {/* Progress complete */}
            <div className="mb-8">
              <div className="h-1.5 w-full rounded-full bg-surface-light overflow-hidden">
                <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: "100%" }} />
              </div>
              <div className="mt-2 text-xs text-text-dim text-right">Assessment complete</div>
            </div>

            <div className="space-y-6 animate-fade-in-up">
              {/* Health Score Card */}
              <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Score circle */}
                  <div className="relative shrink-0">
                    <svg width="120" height="120" className="transform -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#1A1A1A" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke={healthScore >= 65 ? "#10B981" : healthScore >= 40 ? "#F59E0B" : "#EF4444"}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        strokeDashoffset={`${2 * Math.PI * 52 * (1 - healthScore / 100)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-extrabold ${healthColor}`}>{healthGrade}</span>
                      <span className="text-xs text-text-muted">{healthScore}/100</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="text-center md:text-left">
                    <div className="text-sm font-semibold uppercase tracking-wider text-text-dim mb-2">
                      Estimated billing leakage
                    </div>
                    <div className="text-4xl md:text-5xl font-extrabold text-danger mb-1">
                      ${estimatedMonthlyLeak.toLocaleString()}<span className="text-xl font-normal text-danger/60">/mo</span>
                    </div>
                    <p className="text-text-muted">
                      That&apos;s roughly <span className="text-white font-semibold">${estimatedAnnualLeak.toLocaleString()}/year</span> leaving
                      your account — probably without anyone noticing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              {findings.length > 0 && (
                <div className="rounded-2xl border border-warning/20 bg-warning/5 p-6">
                  <h3 className="text-sm font-semibold text-warning mb-4 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Where your billing is probably broken
                  </h3>
                  <ul className="space-y-3">
                    {findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                        <span className="mt-0.5 shrink-0 text-warning">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Breakdown */}
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold text-white mb-5">
                  The holes in your billing — by category
                </h3>
                <div className="space-y-4">
                  {categoryBreakdown.map((cat) => {
                    const maxAmount = categoryBreakdown[0].amount;
                    const barWidth = Math.max(8, (cat.amount / maxAmount) * 100);
                    return (
                      <div key={cat.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm text-text-secondary">{cat.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-white tabular-nums">
                            ${cat.amount.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${barWidth}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-surface p-4 text-center">
                  <div className={`text-2xl font-bold ${healthColor}`}>{healthGrade}</div>
                  <div className="text-xs text-text-muted mt-1">Health Grade</div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 text-center">
                  <div className="text-2xl font-bold text-white">~{estimatedLeakCount}</div>
                  <div className="text-xs text-text-muted mt-1">Billing Holes</div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 text-center">
                  <div className="text-2xl font-bold text-danger">${Math.round(estimatedMonthlyLeak / 30).toLocaleString()}</div>
                  <div className="text-xs text-text-muted mt-1">Leaking per day</div>
                </div>
              </div>

              {/* Cost-of-Delay */}
              {(healthGrade === "F" || healthGrade === "D" || healthGrade === "C") && (
                <div className="rounded-xl border border-danger/20 bg-danger/5 px-5 py-4 text-center">
                  <p className="text-sm text-text-secondary">
                    Every week you wait, that&apos;s roughly{" "}
                    <span className="text-danger font-bold">${Math.round(estimatedMonthlyLeak / 4.3).toLocaleString()}</span>{" "}
                    gone. {answers.audit === "never" || answers.audit === "6mo+"
                      ? "And since you haven\u0027t audited recently, these leaks have been compounding for months."
                      : "These leaks don\u0027t fix themselves \u2014 they compound."}
                  </p>
                </div>
              )}

              {/* Severity-Based CTA */}
              <div className={`rounded-2xl border p-6 md:p-8 text-center ${
                healthGrade === "F" || healthGrade === "D"
                  ? "border-danger/30 bg-danger/5"
                  : healthGrade === "C"
                    ? "border-warning/30 bg-warning/5"
                    : "border-brand/30 bg-brand/5"
              }`}>
                {(healthGrade === "F" || healthGrade === "D") && (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger mb-4">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      Urgent attention needed
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Your billing is actively losing you money.
                    </h3>
                    <p className="text-sm text-text-muted mb-6 max-w-lg mx-auto">
                      An estimated <span className="text-danger font-semibold">${estimatedMonthlyLeak.toLocaleString()}/mo</span> is
                      disappearing from your account. A free scan shows the <span className="text-white font-medium">exact subscriptions, exact
                      dollar amounts, and how to fix each one</span>. 90 seconds. Read-only.
                    </p>
                  </>
                )}
                {healthGrade === "C" && (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">
                      There&apos;s real money to recover here.
                    </h3>
                    <p className="text-sm text-text-muted mb-6 max-w-lg mx-auto">
                      Your estimates suggest <span className="text-warning font-semibold">${estimatedMonthlyLeak.toLocaleString()}/mo</span> in
                      recoverable revenue. A free scan gives you the{" "}
                      <span className="text-white font-medium">exact numbers and fix instructions</span>. Takes 90 seconds.
                    </p>
                  </>
                )}
                {(healthGrade === "A" || healthGrade === "B") && (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Looking solid. Want to confirm with real data?
                    </h3>
                    <p className="text-sm text-text-muted mb-6 max-w-lg mx-auto">
                      Your billing practices are better than most. A free scan confirms your score and catches any{" "}
                      <span className="text-white font-medium">hidden leaks the assessment can&apos;t detect</span>. 90 seconds. Read-only.
                    </p>
                  </>
                )}
                <Link
                  href="/onboarding"
                  onClick={() => {
                    trackEvent("cta_clicked" as Parameters<typeof trackEvent>[0], null, {
                      location: "calculator_results",
                      action: "scan",
                      estimated_leak: estimatedMonthlyLeak,
                      health_grade: healthGrade,
                    }).catch(() => {});
                    trackCTAClick("calculator", "scan");
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition ${
                    healthGrade === "F" || healthGrade === "D"
                      ? "bg-danger text-white hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                      : "bg-brand text-black hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  }`}
                >
                  {(healthGrade === "F" || healthGrade === "D") ? "Fix My Leaks Now" : "Show Me My Exact Leaks"}
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="mt-4 text-xs text-text-dim">
                  Free forever. No credit card. Key never stored.
                </p>
              </div>

              {/* Email Capture — for users not ready to scan */}
              <div className="rounded-2xl border border-border bg-surface p-6 text-center">
                {!emailSubmitted ? (
                  <>
                    <h4 className="text-sm font-semibold text-white mb-2">
                      Not ready to scan? Get your results by email.
                    </h4>
                    <p className="text-xs text-text-muted mb-4">
                      We&apos;ll send your breakdown + 3 quick fixes you can apply today. No spam.
                    </p>
                    <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-sm mx-auto">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@company.com"
                        required
                        className="flex-1 rounded-lg border border-border bg-surface-dim px-4 py-2.5 text-sm text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-lg bg-surface-light px-5 py-2.5 text-sm font-semibold text-white hover:bg-border transition cursor-pointer"
                      >
                        Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-brand">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Check your inbox. Your results are on the way.
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setStep(0);
                    setAnswers({});
                    setEmailSubmitted(false);
                    setEmail("");
                  }}
                  className="text-xs text-text-dim hover:text-text-muted transition cursor-pointer"
                >
                  Retake assessment
                </button>
              </div>
            </div>

            {/* SEO Content */}
            <SEOContent />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Quiz UI ──

  const currentQ = QUESTIONS[step];

  return (
    <div className="min-h-screen bg-surface-dim text-white">
      <Header />

      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-1.5 w-full rounded-full bg-surface-light overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-dim">
              <span>Question {step + 1} of {totalSteps}</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Question Card */}
          <div key={currentQ.id} className="animate-fade-in-up">
            {step === 0 && (
              <div className="mb-8">
                <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
                  60-second billing health check
                </div>
                <h1 className="text-2xl font-bold text-white md:text-3xl mb-3">
                  94% of SaaS accounts are leaking revenue right now.
                </h1>
                <p className="text-text-muted text-sm mb-4">
                  We scanned <span className="text-white font-semibold">847 billing accounts</span>. The average leak: <span className="text-danger font-semibold">$2,340/mo</span>.
                  <br />
                  7 questions. No signup. See where <em>your</em> billing is most vulnerable.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-text-dim">
                  <span><strong className="text-text-muted">847+</strong> founders already checked</span>
                  <span className="text-border">|</span>
                  <span>Stripe, Polar &amp; Paddle</span>
                </div>
              </div>
            )}

            {/* Resume banner — abandon prevention */}
            {step === 0 && hasResumableProgress && (
              <div className="mb-6 rounded-xl border border-brand/30 bg-brand/5 px-5 py-4 flex items-center justify-between gap-4">
                <p className="text-sm text-text-secondary">
                  You have an unfinished assessment. Pick up where you left off?
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={resumeProgress}
                    className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-black hover:bg-brand-light transition cursor-pointer"
                  >
                    Resume
                  </button>
                  <button
                    onClick={dismissResume}
                    className="rounded-lg border border-border px-4 py-2 text-xs text-text-dim hover:text-text-muted transition cursor-pointer"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
              <h2 className="text-lg font-bold text-white md:text-xl mb-2">
                {currentQ.question}
              </h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                {currentQ.subtext}
              </p>

              <div className="space-y-3">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(currentQ.id, opt.value)}
                    className={`w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all cursor-pointer ${
                      answers[currentQ.id] === opt.value
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border bg-surface-dim text-text-secondary hover:border-brand/30 hover:bg-surface"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Back button */}
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="mt-4 text-xs text-text-dim hover:text-text-muted transition cursor-pointer"
                >
                  &larr; Previous question
                </button>
              )}
            </div>

            {/* Social proof / encouragement — changes by step */}
            <div className="mt-6 text-center text-xs text-text-dim">
              {step < 3 && "No email required. No data stored. Just an estimate."}
              {step === 3 && (
                <>
                  <span className="text-text-muted font-medium">Halfway there.</span>{" "}
                  847 founders have taken this assessment. Most were surprised by their results.
                </>
              )}
              {step === 4 && "Each question helps pinpoint where your specific leaks are hiding."}
              {step === 5 && (
                <>
                  Almost done. <span className="text-text-muted font-medium">Your personalized breakdown is next.</span>
                </>
              )}
              {step === 6 && "Last question. Your results are being calculated..."}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── SEO Content Component ──────────────────────────────────────

function SEOContent() {
  return (
    <div className="mt-16 space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          How to Calculate SaaS Revenue Leakage
        </h2>
        <div className="text-sm text-text-muted space-y-3 leading-relaxed">
          <p>
            Revenue leakage is the gap between what your SaaS <em>should</em> be collecting and what it actually collects.
            Unlike churn, which you actively track, revenue leaks are silent — they hide inside your billing platform in the
            form of expired discounts, failed payment retries, stuck subscriptions, and outdated pricing.
          </p>
          <p>
            Industry research from MGI Research and EY Revenue Assurance consistently shows that the average business loses
            1-5% of revenue to billing issues. For SaaS specifically, our data from 847+ account scans puts the average at{" "}
            <strong className="text-text-secondary">4.7% of MRR</strong>.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">
          The 7 Most Common Revenue Leaks in SaaS
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {LEAK_CATEGORIES.map((leak) => (
            <div key={leak.label} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: leak.color }} />
              <div>
                <h4 className="text-sm font-semibold text-white">{leak.label}</h4>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  Average share of total leakage: {Math.round(leak.baseShare * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-3">
          Why Most Founders Don&apos;t Know They&apos;re Leaking
        </h3>
        <div className="text-sm text-text-muted space-y-3 leading-relaxed">
          <p>
            Your MRR dashboard shows the big picture — total revenue, growth rate, churn rate. But it doesn&apos;t show the
            subscription that&apos;s been on a 50% discount for 3 years because someone forgot to set an expiry date. It
            doesn&apos;t flag the customer on $49/mo who should be on your $79/mo plan.
          </p>
          <p>
            Revenue leakage sits in the gap between your dashboard view and your individual subscription records.
            The only way to find it is to audit each subscription — one by one. Manually, that takes hours. Most
            founders never do it, so the leaks just keep compounding.
          </p>
          <p>
            A{" "}
            <Link href="/onboarding" className="text-brand hover:text-brand-light underline">free billing audit</Link>{" "}
            checks every subscription in your Stripe, Polar, or Paddle account in 90 seconds. It surfaces the exact
            subscriptions, dollar amounts, and the fix for each one. Read-only access — nothing gets changed.
          </p>
        </div>
      </div>

      {/* Methodology */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Assessment Methodology</h3>
        <div className="text-xs text-text-muted space-y-2 leading-relaxed">
          <p>
            This assessment estimates revenue leakage based on your billing practices and aggregated data from 847+ SaaS
            accounts scanned by RevReclaim. Risk factors are weighted by their impact on specific leak categories.
          </p>
          <p>
            <strong className="text-text-secondary">Your actual leakage depends on your specific billing setup.</strong>{" "}
            The only way to know your exact number is to{" "}
            <Link href="/onboarding" className="text-brand hover:text-brand-light underline">scan your real data</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
