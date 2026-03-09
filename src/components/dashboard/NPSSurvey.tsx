"use client";

import { useState, useEffect } from "react";
import { trackSurvey } from "@/lib/track-survey";

const NPS_SCALE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const STORAGE_KEY = "rr_nps_last_shown";
const COOLDOWN_DAYS = 90;
const MIN_DAYS_AFTER_SCAN = 7;

interface NPSSurveyProps {
  firstScanDate: string | null;
}

/**
 * NPSSurvey — shown on the dashboard 7+ days after the user's first scan.
 * Collects NPS score, reason, and optional referral. Max once per 90 days.
 */
export function NPSSurvey({ firstScanDate }: NPSSurveyProps) {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [referralEmail, setReferralEmail] = useState("");

  useEffect(() => {
    if (!firstScanDate) return;

    const daysSinceScan = (Date.now() - new Date(firstScanDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceScan < MIN_DAYS_AFTER_SCAN) return;

    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const daysSinceShown = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
        if (daysSinceShown < COOLDOWN_DAYS) return;
      }
      // Small delay so the dashboard renders first
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    } catch {
      // localStorage not available
    }
  }, [firstScanDate]);

  function handleSubmit() {
    if (score === null) return;

    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    trackSurvey("nps_survey", {
      score,
      reason: reason.trim() || null,
      referral_email: referralEmail.trim() || null,
    });

    setTimeout(() => setVisible(false), 2000);
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  if (!visible) return null;

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-6 animate-fade-in-up">
      {submitted ? (
        <div className="flex items-center gap-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15">
            <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-brand">
            Thanks! Your feedback shapes what we build next.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                How are we doing?
              </h3>
              <p className="text-xs text-text-muted">
                One number, one minute. Helps us build the right things.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-text-dim hover:text-text-muted transition flex-shrink-0"
              aria-label="Dismiss survey"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* NPS Scale */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                How likely are you to recommend RevReclaim to a fellow founder?
              </label>
              <div className="flex gap-1">
                {NPS_SCALE.map((n) => (
                  <button
                    key={n}
                    onClick={() => setScore(score === n ? null : n)}
                    className={`flex-1 min-w-0 h-9 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      score === n
                        ? n <= 6
                          ? "border-danger bg-danger/15 text-danger"
                          : n <= 8
                            ? "border-yellow-500 bg-yellow-500/15 text-yellow-400"
                            : "border-brand bg-brand/15 text-brand"
                        : "border-border bg-surface text-text-dim hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-dim">Not at all likely</span>
                <span className="text-[10px] text-text-dim">Extremely likely</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                What&apos;s the main reason for your score? <span className="text-text-dim">(optional)</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., found real money I was losing, easy to use..."
                maxLength={300}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            {/* Referral */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Know someone who&apos;d benefit? <span className="text-text-dim">(optional — both get 1 month free)</span>
              </label>
              <input
                type="email"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                placeholder="founder@company.com"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={score === null}
              className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-black hover:bg-brand-light transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}
