"use client";

import { useState, useEffect } from "react";
import { trackSurvey } from "@/lib/track-survey";

const FIX_STATUS_OPTIONS = [
  { value: "yes", label: "Yes, fixed" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No, didn't work" },
];

const TIME_OPTIONS = [
  { value: "under_1min", label: "Under 1 min" },
  { value: "1_5min", label: "1–5 min" },
  { value: "over_5min", label: "Over 5 min" },
];

interface PostFixSurveyProps {
  actionId: string;
  actionType: string;
  onDismiss: () => void;
}

/**
 * PostFixSurvey — shown inline after a recovery action is executed successfully.
 * Collects fix status, time taken, and improvement suggestions.
 */
export function PostFixSurvey({ actionId, actionType, onDismiss }: PostFixSurveyProps) {
  const [submitted, setSubmitted] = useState(false);
  const [fixStatus, setFixStatus] = useState("");
  const [timeTaken, setTimeTaken] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const storageKey = `rr_post_fix_${actionId}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) {
        onDismiss();
      }
    } catch {
      // localStorage not available
    }
  }, [storageKey, onDismiss]);

  function handleSubmit() {
    if (!fixStatus) return;

    setSubmitted(true);
    localStorage.setItem(storageKey, "1");

    trackSurvey("post_fix_survey", {
      action_id: actionId,
      action_type: actionType,
      fix_status: fixStatus,
      time_taken: timeTaken || null,
      suggestion: suggestion.trim() || null,
    });

    setTimeout(() => onDismiss(), 1500);
  }

  function handleDismiss() {
    localStorage.setItem(storageKey, "1");
    onDismiss();
  }

  if (submitted) {
    return (
      <div className="ml-4 mt-2 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 flex items-center gap-2 animate-fade-in-up">
        <svg className="h-3.5 w-3.5 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs font-medium text-brand">Thanks for the feedback!</span>
      </div>
    );
  }

  return (
    <div className="ml-4 mt-2 rounded-lg border border-border bg-surface-dim px-4 py-3 space-y-3 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white">Quick feedback on this fix</span>
        <button
          onClick={handleDismiss}
          className="text-text-dim hover:text-text-muted transition"
          aria-label="Dismiss"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Fix status */}
      <div>
        <label className="block text-[11px] text-text-muted mb-1.5">Did the fix work?</label>
        <div className="flex flex-wrap gap-1.5">
          {FIX_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFixStatus(opt.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium border transition cursor-pointer ${
                fixStatus === opt.value
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-border bg-surface text-text-muted hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time taken */}
      <div>
        <label className="block text-[11px] text-text-muted mb-1.5">
          How long did it take? <span className="text-text-dim">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeTaken(timeTaken === opt.value ? "" : opt.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium border transition cursor-pointer ${
                timeTaken === opt.value
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-border bg-surface text-text-muted hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion */}
      <div>
        <label className="block text-[11px] text-text-muted mb-1.5">
          What would make this easier? <span className="text-text-dim">(optional)</span>
        </label>
        <input
          type="text"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="e.g., auto-apply the fix, add a preview..."
          maxLength={200}
          className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!fixStatus}
        className="rounded-md bg-brand px-3 py-1.5 text-[11px] font-bold text-black hover:bg-brand-light transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Submit
      </button>
    </div>
  );
}
