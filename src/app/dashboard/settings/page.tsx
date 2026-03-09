"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BillingPlatform } from "@/lib/platforms/types";
import { PLATFORM_LABELS } from "@/lib/platforms/types";
import { CancelSubscriptionDialog } from "@/components/dashboard/CancelSubscriptionDialog";
import NotificationPreferences from "@/components/dashboard/NotificationPreferences";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [platform, setPlatform] = useState<BillingPlatform>("stripe");
  const [frequency, setFrequency] = useState<"weekly" | "daily" | "monthly">("weekly");
  const [isActive, setIsActive] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [billingLoading, setBillingLoading] = useState(false);

  // Action API Key state
  const [actionApiKey, setActionApiKey] = useState("");
  const [showActionKey, setShowActionKey] = useState(false);
  const [hasExistingActionKey, setHasExistingActionKey] = useState(false);
  const [actionKeySaving, setActionKeySaving] = useState(false);
  const [actionKeyMessage, setActionKeyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Change Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Update Email state
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");

  // Cancel Subscription state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Slack Webhook state
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [hasExistingWebhook, setHasExistingWebhook] = useState(false);
  const [slackSaving, setSlackSaving] = useState(false);
  const [slackMessage, setSlackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete Account state
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      setCurrentEmail(user.email || "");

      // Fetch plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (cancelled) return;
      if (profile) {
        setUserPlan((profile as Record<string, unknown>).plan as string || "free");
      }

      const { data } = await supabase
        .from("scan_configs")
        .select("scan_frequency, is_active, platform, action_api_key_encrypted, slack_webhook_url")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;
      if (data) {
        setHasExistingConfig(true);
        setFrequency((data.scan_frequency || "weekly") as "weekly" | "daily" | "monthly");
        setIsActive(data.is_active);
        if (data.platform) setPlatform(data.platform as BillingPlatform);
        setApiKey("");
        setHasExistingActionKey(!!data.action_api_key_encrypted);
        if (data.slack_webhook_url) {
          setHasExistingWebhook(true);
        }
      }

      setLoading(false);
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently fail
    }
    setBillingLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/scan-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey || undefined,
          actionApiKey: actionApiKey || undefined,
          platform,
          frequency,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: data.message });
      setHasExistingConfig(true);
      setApiKey("");
      if (actionApiKey) {
        setHasExistingActionKey(true);
        setActionApiKey("");
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    }

    setSaving(false);
  }

  async function handleDeleteConfig() {
    if (!confirm("Are you sure? This will stop all automated scans and delete your stored API key.")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/scan-config", {
        method: "DELETE",
      });

      if (response.ok) {
        setHasExistingConfig(false);
        setIsActive(false);
        setApiKey("");
        setMessage({ type: "success", text: "Auto-scan configuration deleted." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete. Please try again." });
    }
    setSaving(false);
  }

  async function handleSaveActionKey(e: React.FormEvent) {
    e.preventDefault();
    setActionKeySaving(true);
    setActionKeyMessage(null);

    try {
      const response = await fetch("/api/scan-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionApiKey: actionApiKey,
          platform,
          frequency,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setActionKeyMessage({ type: "error", text: data.error });
        setActionKeySaving(false);
        return;
      }

      setActionKeyMessage({ type: "success", text: "Action API Key saved successfully." });
      setHasExistingActionKey(true);
      setActionApiKey("");
    } catch {
      setActionKeyMessage({ type: "error", text: "Failed to save. Please try again." });
    }

    setActionKeySaving(false);
  }

  async function handleDeleteActionKey() {
    if (!confirm("Are you sure? This will disable automated recovery actions (payment retries, coupon removals, etc.).")) {
      return;
    }

    setActionKeySaving(true);
    try {
      const response = await fetch("/api/scan-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionApiKey: "__DELETE__",
          platform,
          frequency,
          isActive,
        }),
      });

      if (response.ok) {
        setHasExistingActionKey(false);
        setActionApiKey("");
        setActionKeyMessage({ type: "success", text: "Action API Key removed." });
      }
    } catch {
      setActionKeyMessage({ type: "error", text: "Failed to delete. Please try again." });
    }
    setActionKeySaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPasswordSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordMessage({ type: "error", text: error.message });
      } else {
        setPasswordMessage({ type: "success", text: "Password updated successfully." });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Failed to update password. Please try again." });
    }

    setPasswordSaving(false);
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMessage(null);

    if (!newEmail || !newEmail.includes("@")) {
      setEmailMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    if (newEmail === currentEmail) {
      setEmailMessage({ type: "error", text: "That's already your current email." });
      return;
    }

    setEmailSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        setEmailMessage({ type: "error", text: error.message });
      } else {
        setEmailMessage({ type: "success", text: "Confirmation link sent to your new email. Please check your inbox." });
        setNewEmail("");
      }
    } catch {
      setEmailMessage({ type: "error", text: "Failed to update email. Please try again." });
    }

    setEmailSaving(false);
  }

  async function handleCancelSubscription() {
    setCancelLoading(true);
    try {
      // Redirect to Polar billing portal for cancellation
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setCancelLoading(false);
      setShowCancelDialog(false);
    }
  }

  async function handleSaveSlackWebhook(e: React.FormEvent) {
    e.preventDefault();
    setSlackSaving(true);
    setSlackMessage(null);

    // Validate URL format
    try {
      const parsed = new URL(slackWebhookUrl);
      if (parsed.hostname !== "hooks.slack.com" || !parsed.pathname.startsWith("/services/")) {
        setSlackMessage({ type: "error", text: "Please enter a valid Slack webhook URL (https://hooks.slack.com/services/...)" });
        setSlackSaving(false);
        return;
      }
    } catch {
      setSlackMessage({ type: "error", text: "Please enter a valid URL." });
      setSlackSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("scan_configs")
        .update({ slack_webhook_url: slackWebhookUrl })
        .eq("user_id", user.id);

      if (error) {
        setSlackMessage({ type: "error", text: "Failed to save webhook URL." });
      } else {
        setSlackMessage({ type: "success", text: "Slack webhook saved. You'll receive notifications after each scan." });
        setHasExistingWebhook(true);
        setSlackWebhookUrl("");
      }
    } catch {
      setSlackMessage({ type: "error", text: "Failed to save. Please try again." });
    }

    setSlackSaving(false);
  }

  async function handleRemoveSlackWebhook() {
    setSlackSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("scan_configs")
        .update({ slack_webhook_url: null })
        .eq("user_id", user.id);

      setHasExistingWebhook(false);
      setSlackWebhookUrl("");
      setSlackMessage({ type: "success", text: "Slack webhook removed." });
    } catch {
      setSlackMessage({ type: "error", text: "Failed to remove. Please try again." });
    }
    setSlackSaving(false);
  }

  async function handleTestSlackWebhook() {
    setSlackSaving(true);
    setSlackMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: config } = await supabase
        .from("scan_configs")
        .select("slack_webhook_url")
        .eq("user_id", user.id)
        .single();

      if (!config?.slack_webhook_url) {
        setSlackMessage({ type: "error", text: "No webhook URL configured." });
        setSlackSaving(false);
        return;
      }

      // Send test message
      const res = await fetch(config.slack_webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "✅ *RevReclaim connected!*\nYou'll receive scan notifications in this channel.",
        }),
      });

      if (res.ok) {
        setSlackMessage({ type: "success", text: "Test message sent! Check your Slack channel." });
      } else {
        setSlackMessage({ type: "error", text: "Failed to send test message. Please check your webhook URL." });
      }
    } catch {
      setSlackMessage({ type: "error", text: "Failed to send test message." });
    }

    setSlackSaving(false);
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, reports, and settings will be permanently deleted.")) {
      return;
    }

    setDeleting(true);
    setDeleteMessage(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteMessage({ type: "error", text: data.error });
        setDeleting(false);
        return;
      }

      // Account deleted — sign out and redirect
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/?deleted=1");
    } catch {
      setDeleteMessage({ type: "error", text: "Failed to delete account. Please try again." });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          Configure automated scans and manage your account.
        </p>
      </div>

      {/* Billing section — only show for paid users */}
      {userPlan !== "free" && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Subscription</h2>
              <p className="text-sm text-text-muted">
                You&apos;re on the <span className="text-brand font-semibold uppercase">{userPlan}</span> plan.
                Manage your subscription, update payment method, or change plans.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={handleManageBilling}
                disabled={billingLoading}
                className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition disabled:opacity-50 cursor-pointer text-sm"
              >
                {billingLoading ? "Loading..." : "Manage Billing"}
              </button>
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-5 py-2 text-xs text-text-dim hover:text-danger transition cursor-pointer"
              >
                Cancel plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel subscription dialog */}
      {showCancelDialog && (
        <CancelSubscriptionDialog
          plan={userPlan}
          onCancel={() => setShowCancelDialog(false)}
          onConfirm={handleCancelSubscription}
          loading={cancelLoading}
        />
      )}

      {/* Auto-scan config */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-white mb-1">Automated Scans</h2>
        <p className="text-sm text-text-muted mb-6">
          Set up recurring scans to catch new revenue leaks automatically.
          Your API key is encrypted and stored securely.
        </p>

        {/* Plan gate for free users */}
        {userPlan === "free" && (
          <div className="rounded-xl border border-border bg-surface-dim p-6 text-center mb-6">
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Pro Feature</h3>
            <p className="text-sm text-text-muted mb-4 max-w-sm mx-auto">
              Automated scans require a Pro or Team plan. Upgrade to get weekly scanning, email alerts, and more.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex px-5 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition text-sm"
            >
              Upgrade to Pro — $299/mo
            </Link>
          </div>
        )}

        {userPlan !== "free" && (
        <form onSubmit={handleSave} className="space-y-5">
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
                  className={`py-2.5 text-sm font-medium rounded-lg border transition cursor-pointer ${
                    platform === p
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-surface-dim text-text-muted hover:border-border hover:text-white"
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {PLATFORM_LABELS[platform]} API Key
              {hasExistingConfig && (
                <span className="text-brand ml-2 font-normal">(key saved — enter new to update)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasExistingConfig ? "Enter new key to update..." : platform === "stripe" ? "rk_live_..." : platform === "polar" ? "polar_oat_..." : "Your API key..."}
                className="w-full px-4 py-3 pr-12 bg-surface-dim border border-border rounded-lg text-white placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition"
                aria-label={showKey ? "Hide API key" : "Show API key"}
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

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Scan Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["weekly", "daily", "monthly"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2.5 text-sm font-medium rounded-lg border transition cursor-pointer ${
                    frequency === freq
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-surface-dim text-text-muted hover:border-border"
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Enable auto-scans</p>
              <p className="text-xs text-text-muted">Automatically scan on schedule</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              role="switch"
              aria-checked={isActive}
              aria-label="Enable auto-scans"
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                isActive ? "bg-brand" : "bg-border"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isActive ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-brand/10 border border-brand/20 text-brand"
                  : "bg-danger/10 border border-danger/20 text-danger"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || (!apiKey && !hasExistingConfig)}
              className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {saving ? "Saving..." : hasExistingConfig ? "Update Settings" : "Enable Auto-Scans"}
            </button>

            {hasExistingConfig && (
              <button
                type="button"
                onClick={handleDeleteConfig}
                disabled={saving}
                className="px-4 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                Delete Configuration
              </button>
            )}
          </div>
        </form>
        )}
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-white">Your keys are encrypted</p>
            <p className="text-xs text-text-muted mt-1">
              Your API keys are encrypted with AES-256-GCM before storage.
              The scan key is read-only. The action key is used only for approved recovery actions.
              You can delete your keys anytime from this page.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <NotificationPreferences />

      {/* Slack Notifications */}
      {userPlan !== "free" && hasExistingConfig && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-white">Slack Notifications</h2>
            <svg className="w-5 h-5 text-text-dim" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
          </div>
          <p className="text-sm text-text-muted mb-6">
            Get scan results delivered to a Slack channel. Create an{" "}
            <a
              href="https://api.slack.com/messaging/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              incoming webhook
            </a>{" "}
            in your Slack workspace and paste the URL below.
          </p>

          <form onSubmit={handleSaveSlackWebhook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Webhook URL
                {hasExistingWebhook && (
                  <span className="text-brand ml-2 font-normal">(connected — enter new to update)</span>
                )}
              </label>
              <input
                type="url"
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder={hasExistingWebhook ? "Enter new URL to update..." : "https://hooks.slack.com/services/T.../B.../..."}
                className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition font-mono text-sm"
              />
            </div>

            {slackMessage && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  slackMessage.type === "success"
                    ? "bg-brand/10 border border-brand/20 text-brand"
                    : "bg-danger/10 border border-danger/20 text-danger"
                }`}
              >
                {slackMessage.text}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={slackSaving || !slackWebhookUrl}
                className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {slackSaving ? "Saving..." : hasExistingWebhook ? "Update Webhook" : "Connect Slack"}
              </button>

              {hasExistingWebhook && (
                <>
                  <button
                    type="button"
                    onClick={handleTestSlackWebhook}
                    disabled={slackSaving}
                    className="px-4 py-2.5 text-sm text-brand hover:bg-brand/10 rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    Send Test
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSlackWebhook}
                    disabled={slackSaving}
                    className="px-4 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Action API Key — for write operations */}
      {userPlan !== "free" && hasExistingConfig && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-white">Action API Key</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Optional
            </span>
          </div>
          <p className="text-sm text-text-muted mb-6">
            Enable automated recovery actions (retry payments, remove expired coupons, cancel ghost subscriptions).
            This key requires <strong className="text-white">write access</strong> to your billing platform.
          </p>

          {/* Platform-specific instructions */}
          <div className="rounded-lg border border-border bg-surface-dim p-4 mb-5">
            <p className="text-xs font-medium text-text-secondary mb-2">
              How to create a {PLATFORM_LABELS[platform]} Action API Key:
            </p>
            {platform === "stripe" ? (
              <ol className="text-xs text-text-muted space-y-1 list-decimal list-inside">
                <li>Go to Stripe Dashboard → Developers → API Keys → Create restricted key</li>
                <li>Grant <strong className="text-white">Write</strong> access to: Invoices, Subscriptions, Customers</li>
                <li>Keep all other permissions as &quot;None&quot;</li>
                <li>Copy the key (<code className="text-brand">rk_live_...</code>) and paste below</li>
              </ol>
            ) : platform === "polar" ? (
              <ol className="text-xs text-text-muted space-y-1 list-decimal list-inside">
                <li>Go to Polar Dashboard → Settings → Personal Access Tokens</li>
                <li>Create a token with <strong className="text-white">subscriptions:write</strong> scope</li>
                <li>Copy the token and paste below</li>
              </ol>
            ) : (
              <ol className="text-xs text-text-muted space-y-1 list-decimal list-inside">
                <li>Go to Paddle Dashboard → Developer Tools → Authentication</li>
                <li>Create an API key with <strong className="text-white">write</strong> access to Subscriptions</li>
                <li>Copy the key and paste below</li>
              </ol>
            )}
          </div>

          <form onSubmit={handleSaveActionKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {PLATFORM_LABELS[platform]} Write API Key
                {hasExistingActionKey && (
                  <span className="text-brand ml-2 font-normal">(key saved — enter new to update)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showActionKey ? "text" : "password"}
                  value={actionApiKey}
                  onChange={(e) => setActionApiKey(e.target.value)}
                  placeholder={hasExistingActionKey ? "Enter new key to update..." : platform === "stripe" ? "rk_live_..." : "Your write API key..."}
                  className="w-full px-4 py-3 pr-12 bg-surface-dim border border-border rounded-lg text-white placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowActionKey(!showActionKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition"
                  aria-label={showActionKey ? "Hide API key" : "Show API key"}
                >
                  {showActionKey ? (
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

            {actionKeyMessage && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  actionKeyMessage.type === "success"
                    ? "bg-brand/10 border border-brand/20 text-brand"
                    : "bg-danger/10 border border-danger/20 text-danger"
                }`}
              >
                {actionKeyMessage.text}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={actionKeySaving || !actionApiKey}
                className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {actionKeySaving ? "Saving..." : hasExistingActionKey ? "Update Action Key" : "Save Action Key"}
              </button>

              {hasExistingActionKey && (
                <button
                  type="button"
                  onClick={handleDeleteActionKey}
                  disabled={actionKeySaving}
                  className="px-4 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  Remove Key
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Change Password */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-white mb-1">Change Password</h2>
        <p className="text-sm text-text-muted mb-6">
          Update your account password. Must be at least 8 characters.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition text-sm"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition text-sm"
            />
          </div>

          {passwordMessage && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                passwordMessage.type === "success"
                  ? "bg-brand/10 border border-brand/20 text-brand"
                  : "bg-danger/10 border border-danger/20 text-danger"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordSaving || !newPassword || !confirmPassword}
            className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Update Email */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-white mb-1">Update Email</h2>
        <p className="text-sm text-text-muted mb-6">
          Change the email address associated with your account.
          {currentEmail && (
            <span className="block mt-1">
              Current email: <span className="text-white font-mono">{currentEmail}</span>
            </span>
          )}
        </p>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-text-secondary mb-1.5">
              New email address
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition text-sm"
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-text-muted">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>A confirmation link will be sent to your new email address. Click it to complete the change.</span>
          </div>

          {emailMessage && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                emailMessage.type === "success"
                  ? "bg-brand/10 border border-brand/20 text-brand"
                  : "bg-danger/10 border border-danger/20 text-danger"
              }`}
            >
              {emailMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={emailSaving || !newEmail}
            className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {emailSaving ? "Sending..." : "Update Email"}
          </button>
        </form>
      </div>

      {/* Danger Zone — Delete Account */}
      <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6">
        <h2 className="text-lg font-bold text-danger mb-1">Danger Zone</h2>
        <p className="text-sm text-text-muted mb-6">
          Permanently delete your account and all associated data. This action cannot be undone.
          Your scan configurations, saved reports, and encrypted API keys will all be removed.
        </p>

        {deleteMessage && (
          <div
            className={`rounded-lg px-4 py-3 text-sm mb-4 ${
              deleteMessage.type === "success"
                ? "bg-brand/10 border border-brand/20 text-brand"
                : "bg-danger/10 border border-danger/20 text-danger"
            }`}
          >
            {deleteMessage.text}
          </div>
        )}

        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="px-6 py-2.5 bg-danger hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          {deleting ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}
