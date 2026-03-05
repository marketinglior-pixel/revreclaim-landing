"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo - clickable */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">RevReclaim</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" role="navigation" aria-label="Main navigation">
          <a href="#how-it-works" className="text-sm text-[#999] transition-colors hover:text-white">How it works</a>
          <a href="#pricing" className="text-sm text-[#999] transition-colors hover:text-white">Pricing</a>
          <a href="#faq" className="text-sm text-[#999] transition-colors hover:text-white">FAQ</a>
        </nav>

        {/* Desktop auth buttons + Mobile hamburger */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-[#999] hover:text-white transition hidden md:block"
              >
                Dashboard
              </Link>
              <Link
                href="/scan"
                className="rounded-lg bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hidden md:block"
              >
                New Scan
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-[#999] hover:text-white transition hidden md:block"
              >
                Sign In
              </Link>
              <Link
                href="/scan"
                onClick={() => trackEvent("cta_clicked", null, { location: "header", action: "scan" }).catch(() => {})}
                className="rounded-lg bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hidden md:block"
              >
                Paste Your Key &rarr; See Your Leaks
              </Link>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#2A2A2A] bg-[#111] md:hidden cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[65px] z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="absolute left-0 right-0 top-full z-50 border-b border-[#2A2A2A] bg-[#0A0A0A] md:hidden">
            <nav className="mx-auto max-w-6xl px-6 py-4 space-y-1" role="navigation" aria-label="Mobile navigation">
              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm text-[#999] hover:bg-[#111] hover:text-white transition"
              >
                How it works
              </a>
              <a
                href="#pricing"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm text-[#999] hover:bg-[#111] hover:text-white transition"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm text-[#999] hover:bg-[#111] hover:text-white transition"
              >
                FAQ
              </a>

              <div className="border-t border-[#1A1A1A] my-2" />

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm text-[#999] hover:bg-[#111] hover:text-white transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/scan"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg bg-[#10B981] px-4 py-3 text-sm font-semibold text-black text-center hover:bg-[#34D399] transition mt-2"
                  >
                    New Scan
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm text-[#999] hover:bg-[#111] hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/scan"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg bg-[#10B981] px-4 py-3 text-sm font-semibold text-black text-center hover:bg-[#34D399] transition mt-2"
                  >
                    Paste Your Key &rarr; See Your Leaks
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
