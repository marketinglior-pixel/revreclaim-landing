"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function DashboardNav({
  email,
  plan,
}: {
  email: string;
  plan: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-surface-dim/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">RevReclaim</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-2 text-xs text-text-muted hover:text-white hover:bg-surface-light rounded-lg transition"
            >
              Reports
            </Link>
            <Link
              href="/dashboard/actions"
              className="px-3 py-2 text-xs text-text-muted hover:text-white hover:bg-surface-light rounded-lg transition"
            >
              Actions
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-3 py-2 text-xs text-text-muted hover:text-white hover:bg-surface-light rounded-lg transition"
            >
              Settings
            </Link>
            {plan === "team" && (
              <Link
                href="/dashboard/team"
                className="px-3 py-2 text-xs text-text-muted hover:text-white hover:bg-surface-light rounded-lg transition"
              >
                Team
              </Link>
            )}
            <Link
              href="/scan"
              className="px-3 py-2 text-xs text-brand hover:text-brand-light hover:bg-brand/10 rounded-lg transition font-medium"
            >
              Paste Your Key &rarr;
            </Link>
          </nav>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-light transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand">
                {email[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-text-muted hidden md:block">{email}</span>
            {plan !== "free" && (
              <span className="px-2 py-0.5 text-xs font-bold bg-brand/10 text-brand rounded">
                {plan === "team" ? "TEAM" : "PRO"}
              </span>
            )}
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-light transition md:hidden"
                >
                  Reports
                </Link>
                <Link
                  href="/dashboard/actions"
                  className="block px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-light transition md:hidden"
                >
                  Actions
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-light transition"
                >
                  Settings
                </Link>
                {plan === "team" && (
                  <Link
                    href="/dashboard/team"
                    className="block px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-light transition"
                  >
                    Team
                  </Link>
                )}
                {plan !== "free" && (
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      trackEvent("billing_portal_opened", null, {}).catch(() => {});
                      try {
                        const res = await fetch("/api/billing-portal", { method: "POST" });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch {
                        // Silently fail — user can try from settings
                      }
                    }}
                    className="w-full text-left block px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-light transition cursor-pointer"
                  >
                    Billing
                  </button>
                )}
                <Link
                  href="/scan"
                  className="block px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-light transition md:hidden"
                >
                  Run Another Scan &rarr;
                </Link>
                <div className="border-t border-border" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
