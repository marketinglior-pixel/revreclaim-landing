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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
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

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white text-sm font-medium text-gray-800 rounded-lg min-h-[44px] transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2 text-text-dim">or</span>
            </div>
          </div>

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
