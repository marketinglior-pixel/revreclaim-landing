"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const MRR_OPTIONS = [
  { value: "under_10k", label: "Under $10K" },
  { value: "10k_30k", label: "$10K – $30K" },
  { value: "30k_100k", label: "$30K – $100K" },
  { value: "100k_500k", label: "$100K – $500K" },
  { value: "500k_plus", label: "$500K+" },
];

const AWARENESS_OPTIONS = [
  { value: "yes_some", label: "Yes, I knew about some" },
  { value: "no_none", label: "No, had no idea" },
  { value: "suspected", label: "I suspected but wasn't sure" },
];

const STORAGE_KEY = "rr_post_scan_survey_done";

/**
 * PostScanSurvey — shown once per user after their first scan report.
 * Collects MRR range + leak awareness for proprietary segmentation data.
 * Fires analytics event with responses for downstream enrichment.
 */
export function PostScanSurvey({ userId }: { userId: string | null }) {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mrrRange, setMrrRange] = useState("");
  const [awareness, setAwareness] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Only show once — check localStorage
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // Small delay so the report renders first
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  async function handleSubmit() {
    if (!mrrRange || !awareness) return;

    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, "1");

    // Track survey response (fire-and-forget)
    trackEvent("post_scan_survey" as Parameters<typeof trackEvent>[0], userId, {
      mrr_range: mrrRange,
      leak_awareness: awareness,
      feedback: feedback.trim() || null,
    }).catch(() => {});

    // Auto-dismiss after 2 seconds
    setTimeout(() => setVisible(false), 2000);
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
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
            Thanks! This helps us improve RevReclaim for your use case.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Quick question — help us help you
              </h3>
              <p className="text-xs text-text-muted">
                2 questions, 10 seconds. Helps us tailor recovery insights to your stage.
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
            {/* MRR Range */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                What&apos;s your current MRR range?
              </label>
              <div className="flex flex-wrap gap-2">
                {MRR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMrrRange(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition cursor-pointer ${
                      mrrRange === opt.value
                        ? "border-brand bg-brand/15 text-brand"
                        : "border-border bg-surface text-text-muted hover:border-border hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Awareness */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Were you aware of these leaks before scanning?
              </label>
              <div className="flex flex-wrap gap-2">
                {AWARENESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAwareness(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition cursor-pointer ${
                      awareness === opt.value
                        ? "border-brand bg-brand/15 text-brand"
                        : "border-border bg-surface text-text-muted hover:border-border hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional feedback */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                What would you do with recovered revenue? <span className="text-text-dim">(optional)</span>
              </label>
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g., hire an engineer, increase ad spend, reinvest in product..."
                maxLength={200}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!mrrRange || !awareness}
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
