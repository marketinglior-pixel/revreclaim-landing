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
            <a
              href="https://www.producthunt.com/products/revreclaim?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-revreclaim"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block transition-opacity hover:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1096804&theme=light&t=1773346857240"
                alt="RevReclaim - SaaS billing leaks cost you thousands. We find them in 90s. | Product Hunt"
                width="200"
                height="43"
                loading="lazy"
              />
            </a>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/scan" className="text-sm text-text-muted transition-colors hover:text-white">Free Scan</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-text-muted transition-colors hover:text-white">How It Works</Link></li>
              <li><Link href="/#pricing" className="text-sm text-text-muted transition-colors hover:text-white">Pricing</Link></li>
              <li><Link href="/#faq" className="text-sm text-text-muted transition-colors hover:text-white">FAQ</Link></li>
              <li><Link href="/blog" className="text-sm text-text-muted transition-colors hover:text-white">Blog</Link></li>
              <li><Link href="/calculator" className="text-sm text-text-muted transition-colors hover:text-white">Leakage Calculator</Link></li>
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
              <li><Link href="/security" className="text-sm text-text-muted transition-colors hover:text-white">Security</Link></li>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="https://www.linkedin.com/company/revreclaim" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-white" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61586612258954" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-white" aria-label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://x.com/RevReclaim" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-white" aria-label="X">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Read-only access. Your data stays yours.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
