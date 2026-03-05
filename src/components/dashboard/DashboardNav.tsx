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
    <header className="border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">RevReclaim</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] rounded-md transition"
            >
              Reports
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-3 py-1.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] rounded-md transition"
            >
              Settings
            </Link>
            {plan === "team" && (
              <Link
                href="/dashboard/team"
                className="px-3 py-1.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] rounded-md transition"
              >
                Team
              </Link>
            )}
            <Link
              href="/scan"
              className="px-3 py-1.5 text-sm text-[#10B981] hover:text-[#34D399] hover:bg-[#10B981]/10 rounded-md transition font-medium"
            >
              Paste Your Key &rarr;
            </Link>
          </nav>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#1A1A1A] transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#10B981]">
                {email[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-[#999] hidden md:block">{email}</span>
            {plan !== "free" && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] rounded">
                {plan === "team" ? "TEAM" : "PRO"}
              </span>
            )}
            <svg className="w-4 h-4 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#111] border border-[#2A2A2A] rounded-xl shadow-xl z-20 overflow-hidden">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] transition md:hidden"
                >
                  Reports
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] transition"
                >
                  Settings
                </Link>
                {plan === "team" && (
                  <Link
                    href="/dashboard/team"
                    className="block px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] transition"
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
                    className="w-full text-left block px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] transition cursor-pointer"
                  >
                    Billing
                  </button>
                )}
                <Link
                  href="/scan"
                  className="block px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#1A1A1A] transition md:hidden"
                >
                  Run Another Scan &rarr;
                </Link>
                <div className="border-t border-[#2A2A2A]" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition cursor-pointer"
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
