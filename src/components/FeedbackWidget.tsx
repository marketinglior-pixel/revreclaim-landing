"use client";

import { useState } from "react";
import { trackSurvey } from "@/lib/track-survey";

const CATEGORIES = [
  { value: "bug", label: "Bug" },
  { value: "feature_request", label: "Feature Request" },
  { value: "general", label: "General" },
];

/**
 * FeedbackWidget — floating button (bottom-right) on all pages.
 * Opens a compact modal for submitting bugs, feature requests, or general feedback.
 */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";

  function handleSubmit() {
    if (!category || !feedback.trim()) return;

    setSubmitted(true);

    trackSurvey("feedback_widget", {
      category,
      feedback: feedback.trim(),
      email: email.trim() || null,
      page_path: pagePath,
    });

    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setCategory("");
      setFeedback("");
      setEmail("");
    }, 1500);
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-surface-lighter border border-border shadow-lg hover:border-brand/50 hover:bg-surface transition group"
        aria-label="Send feedback"
      >
        {open ? (
          <svg className="h-5 w-5 text-text-muted group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-text-muted group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
      </button>

      {/* Feedback panel */}
      {open && (
        <div className="fixed bottom-20 left-5 z-50 w-80 rounded-2xl border border-border bg-surface shadow-2xl animate-fade-in-up">
          {submitted ? (
            <div className="flex items-center gap-3 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 flex-shrink-0">
                <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-brand">
                Feedback sent! We read every message.
              </p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Send Feedback</h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Bug, feature request, or anything else. We read everything.
                </p>
              </div>

              {/* Category pills */}
              <div>
                <div className="flex gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition cursor-pointer ${
                        category === cat.value
                          ? "border-brand bg-brand/15 text-brand"
                          : "border-border bg-surface-dim text-text-muted hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback text */}
              <div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface-dim px-3 py-2 text-xs text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                />
                <div className="text-right mt-0.5">
                  <span className="text-[10px] text-text-dim">{feedback.length}/500</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email for follow-up (optional)"
                  className="w-full rounded-lg border border-border bg-surface-dim px-3 py-2 text-xs text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!category || !feedback.trim()}
                className="w-full rounded-lg bg-brand px-4 py-2 text-xs font-bold text-black hover:bg-brand-light transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Send Feedback
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
