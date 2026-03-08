"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Preferences {
  scan_complete: boolean;
  weekly_summary: boolean;
  onboarding_drip: boolean;
  marketing_tips: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  scan_complete: true,
  weekly_summary: true,
  onboarding_drip: true,
  marketing_tips: true,
};

const PREFERENCE_ITEMS: {
  key: keyof Preferences;
  label: string;
  description: string;
}[] = [
  {
    key: "scan_complete",
    label: "Scan completion emails",
    description: "Get notified when a scan finishes with a summary of findings",
  },
  {
    key: "weekly_summary",
    label: "Weekly summary reports",
    description:
      "Receive a weekly email with your billing health trends",
  },
  {
    key: "onboarding_drip",
    label: "Getting started tips",
    description: "Helpful tips and guides for new users",
  },
  {
    key: "marketing_tips",
    label: "Product updates & tips",
    description:
      "New features, best practices, and revenue recovery tips",
  },
];

export default function NotificationPreferences() {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", user.id)
        .single();

      if (cancelled) return;
      if (profile?.notification_preferences) {
        const saved = profile.notification_preferences as unknown as Partial<Preferences>;
        setPreferences({ ...DEFAULT_PREFERENCES, ...saved });
      }
      setLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleToggle(key: keyof Preferences) {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);

    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          notification_preferences: JSON.parse(JSON.stringify(newPrefs)),
        })
        .eq("id", user.id);

      if (error) {
        // Revert on error
        setPreferences(preferences);
        setMessage({
          type: "error",
          text: "Failed to save preferences.",
        });
      } else {
        setMessage({ type: "success", text: "Preferences saved." });
        setTimeout(() => setMessage(null), 2000);
      }
    } catch {
      setPreferences(preferences);
      setMessage({
        type: "error",
        text: "Failed to save. Please try again.",
      });
    }

    setSaving(false);
  }

  if (!loaded) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-lg font-bold text-white">
          Email Notifications
        </h2>
        <svg
          className="w-5 h-5 text-text-dim"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      </div>
      <p className="text-sm text-text-muted mb-6">
        Choose which emails you&apos;d like to receive.
      </p>

      <div className="space-y-1">
        {PREFERENCE_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-white">
                {item.label}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {item.description}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences[item.key]}
              aria-label={`Toggle ${item.label}`}
              onClick={() => handleToggle(item.key)}
              disabled={saving}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50 ${
                preferences[item.key] ? "bg-brand" : "bg-border"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  preferences[item.key]
                    ? "translate-x-5.5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-brand/10 border border-brand/20 text-brand"
              : "bg-danger/10 border border-danger/20 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="text-xs text-text-dim mt-4">
        You can unsubscribe from any email at any time. We never share your
        email with third parties.
      </p>
    </div>
  );
}
