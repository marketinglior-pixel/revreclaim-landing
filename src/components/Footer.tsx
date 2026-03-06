import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-light py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">RevReclaim</span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed max-w-[200px]">
              Find and fix revenue leaks in your billing. Built for SaaS founders.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/scan" className="text-sm text-text-muted transition-colors hover:text-white">Free Scan</Link></li>
              <li><a href="/#how-it-works" className="text-sm text-text-muted transition-colors hover:text-white">How It Works</a></li>
              <li><a href="/#pricing" className="text-sm text-text-muted transition-colors hover:text-white">Pricing</a></li>
              <li><a href="/#faq" className="text-sm text-text-muted transition-colors hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/login" className="text-sm text-text-muted transition-colors hover:text-white">Sign In</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-text-muted transition-colors hover:text-white">Create Account</Link></li>
              <li><Link href="/dashboard" className="text-sm text-text-muted transition-colors hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-text-muted transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-text-muted transition-colors hover:text-white">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-sm text-text-muted transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border-light pt-6 md:flex-row">
          <div className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} RevReclaim. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Read-only access. Your data stays yours.
          </div>
        </div>
      </div>
    </footer>
  );
}
