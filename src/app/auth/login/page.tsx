"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { safeRedirect } from "@/lib/safe-redirect";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");
  const searchParams = useSearchParams();
  const redirect = safeRedirect(searchParams.get("redirect"));

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = redirect;
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-text-muted mb-6">
              We sent a login link to <span className="text-white font-medium">{email}</span>.
              Click the link to sign in.
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-sm text-brand hover:text-brand-light transition"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">RevReclaim</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome back</h1>
          <p className="text-sm text-text-muted text-center mb-6">
            Sign in to view your reports and dashboard
          </p>

          {/* Mode toggle */}
          <div className="flex rounded-lg bg-surface-dim border border-border p-1 mb-6">
            <button
              onClick={() => setMode("password")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition cursor-pointer ${
                mode === "password"
                  ? "bg-surface-light text-white"
                  : "text-text-muted hover:text-text-muted"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setMode("magic")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition cursor-pointer ${
                mode === "magic"
                  ? "bg-surface-light text-white"
                  : "text-text-muted hover:text-text-muted"
              }`}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition"
              />
            </div>

            {mode === "password" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-brand hover:text-brand-light transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition"
                />
              </div>
            )}

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-sm font-bold text-black rounded-lg min-h-[44px] transition-all hover:bg-brand-dark hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? "Signing in..."
                : mode === "password"
                  ? "Sign In"
                  : "Send Magic Link"}
            </button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-brand hover:text-brand-light transition">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
