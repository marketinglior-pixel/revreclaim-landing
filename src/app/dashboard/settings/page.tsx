"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "daily" | "monthly">("weekly");
  const [isActive, setIsActive] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [billingLoading, setBillingLoading] = useState(false);

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

  // Delete Account state
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentEmail(user.email || "");

    // Fetch plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserPlan((profile as Record<string, unknown>).plan as string || "free");
    }

    const { data } = await supabase
      .from("scan_configs")
      .select("scan_frequency, is_active")
      .eq("user_id", user.id)
      .single();

    if (data) {
      const config = data as Record<string, unknown>;
      setHasExistingConfig(true);
      setFrequency((config.scan_frequency as "weekly" | "daily" | "monthly") || "weekly");
      setIsActive(config.is_active as boolean);
      setApiKey("");
    }

    setLoading(false);
  }

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
        <div className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#999] mt-1">
          Configure automated scans and manage your account.
        </p>
      </div>

      {/* Billing section — only show for paid users */}
      {userPlan !== "free" && (
        <div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Subscription</h2>
              <p className="text-sm text-[#999]">
                You&apos;re on the <span className="text-[#10B981] font-semibold uppercase">{userPlan}</span> plan.
                Manage your subscription, update payment method, or change plans.
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition disabled:opacity-50 cursor-pointer text-sm shrink-0"
            >
              {billingLoading ? "Loading..." : "Manage Billing"}
            </button>
          </div>
        </div>
      )}

      {/* Auto-scan config */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-6">
        <h2 className="text-lg font-bold text-white mb-1">Automated Scans</h2>
        <p className="text-sm text-[#999] mb-6">
          Set up recurring scans to catch new revenue leaks automatically.
          Your API key is encrypted and stored securely.
        </p>

        {/* Plan gate for free users */}
        {userPlan === "free" && (
          <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-6 text-center mb-6">
            <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Pro Feature</h3>
            <p className="text-sm text-[#999] mb-4 max-w-sm mx-auto">
              Automated scans require a Pro or Team plan. Upgrade to get weekly scanning, email alerts, and more.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition text-sm"
            >
              Upgrade to Pro — $299/mo
            </Link>
          </div>
        )}

        {userPlan !== "free" && (
        <form onSubmit={handleSave} className="space-y-5">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-1.5">
              Stripe Restricted API Key
              {hasExistingConfig && (
                <span className="text-[#10B981] ml-2 font-normal">(key saved — enter new to update)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasExistingConfig ? "Enter new key to update..." : "rk_live_..."}
                className="w-full px-4 py-3 pr-12 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#999] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white transition"
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
            <label className="block text-sm font-medium text-[#ccc] mb-1.5">
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
                      ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                      : "border-[#2A2A2A] bg-[#0A0A0A] text-[#999] hover:border-[#333]"
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
              <p className="text-xs text-[#999]">Automatically scan on schedule</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              role="switch"
              aria-checked={isActive}
              aria-label="Enable auto-scans"
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                isActive ? "bg-[#10B981]" : "bg-[#333]"
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
                  ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                  : "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]"
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
              className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {saving ? "Saving..." : hasExistingConfig ? "Update Settings" : "Enable Auto-Scans"}
            </button>

            {hasExistingConfig && (
              <button
                type="button"
                onClick={handleDeleteConfig}
                disabled={saving}
                className="px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                Delete Configuration
              </button>
            )}
          </div>
        </form>
        )}
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-white">Your key is encrypted</p>
            <p className="text-xs text-[#999] mt-1">
              Your Stripe API key is encrypted with AES-256-GCM before storage.
              We only use read-only restricted keys — we can never modify your billing data.
              You can delete your key anytime from this page.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-6">
        <h2 className="text-lg font-bold text-white mb-1">Change Password</h2>
        <p className="text-sm text-[#999] mb-6">
          Update your account password. Must be at least 8 characters.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-[#ccc] mb-1.5">
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
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#999] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition text-sm"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#ccc] mb-1.5">
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
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#999] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition text-sm"
            />
          </div>

          {passwordMessage && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                passwordMessage.type === "success"
                  ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                  : "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordSaving || !newPassword || !confirmPassword}
            className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Update Email */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-6">
        <h2 className="text-lg font-bold text-white mb-1">Update Email</h2>
        <p className="text-sm text-[#999] mb-6">
          Change the email address associated with your account.
          {currentEmail && (
            <span className="block mt-1">
              Current email: <span className="text-white font-mono">{currentEmail}</span>
            </span>
          )}
        </p>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-[#ccc] mb-1.5">
              New email address
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#999] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition text-sm"
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-[#999]">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>A confirmation link will be sent to your new email address. Click it to complete the change.</span>
          </div>

          {emailMessage && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                emailMessage.type === "success"
                  ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                  : "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]"
              }`}
            >
              {emailMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={emailSaving || !newEmail}
            className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {emailSaving ? "Sending..." : "Update Email"}
          </button>
        </form>
      </div>

      {/* Danger Zone — Delete Account */}
      <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-6">
        <h2 className="text-lg font-bold text-[#EF4444] mb-1">Danger Zone</h2>
        <p className="text-sm text-[#999] mb-6">
          Permanently delete your account and all associated data. This action cannot be undone.
          Your scan configurations, saved reports, and encrypted API keys will all be removed.
        </p>

        {deleteMessage && (
          <div
            className={`rounded-lg px-4 py-3 text-sm mb-4 ${
              deleteMessage.type === "success"
                ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                : "bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]"
            }`}
          >
            {deleteMessage.text}
          </div>
        )}

        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="px-6 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          {deleting ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}
