"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-[#999] mb-6">
              We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
              Click the link to activate your account.
            </p>
            <Link
              href="/auth/login"
              className="text-sm text-[#10B981] hover:text-[#34D399] transition"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">RevReclaim</span>
        </Link>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Create your account</h1>
          <p className="text-sm text-[#999] text-center mb-6">
            Start finding your revenue leaks today
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#ccc] mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#666] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#ccc] mb-1.5">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#666] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#ccc] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#666] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition"
              />
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-3">
                <p className="text-sm text-[#EF4444]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>

          <p className="text-xs text-[#666] text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-sm text-[#666] text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#10B981] hover:text-[#34D399] transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
