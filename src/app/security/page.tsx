import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security | RevReclaim",
  description:
    "How RevReclaim protects your billing data. Read-only API keys, AES-256-GCM encryption, and zero data storage for one-time scans.",
  alternates: { canonical: "https://revreclaim.com/security" },
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Header */}
      <header className="border-b border-border-light">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">RevReclaim</span>
          </Link>
          <Link href="/" className="text-sm text-text-muted hover:text-white transition">
            &larr; Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full mb-6">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs font-medium text-brand">Security</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">How RevReclaim Protects Your Data</h1>
          <p className="text-lg text-text-muted max-w-2xl">
            RevReclaim is designed around one principle: we should never have more access than we need.
            Your API key is restricted, your data is encrypted, and your billing account is untouchable.
          </p>
        </div>

        {/* 3-card security model */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mb-4">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Read-Only Access</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              RevReclaim uses restricted API keys scoped to read operations only. It cannot modify your billing account,
              create charges, cancel subscriptions, or access credit card numbers. This is enforced by Stripe, Paddle,
              and Polar at the platform level &mdash; not just a promise.
            </p>
          </div>

          <div className="rounded-xl border border-brand/20 bg-brand/5 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mb-4">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Key Never Stored</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              For one-time scans, your API key is processed in memory and discarded immediately after.
              It is never written to a database, log file, or any persistent storage. The scan takes ~90 seconds.
              That&apos;s how long your key exists on our servers.
            </p>
          </div>

          <div className="rounded-xl border border-brand/20 bg-brand/5 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mb-4">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Encrypted Everything</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              For auto-scan users who choose to store a key, it is encrypted with AES-256-GCM before storage.
              The encryption key is stored separately from the database. All data in transit uses TLS 1.3.
            </p>
          </div>
        </div>

        {/* What we read vs. What we can't do */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">What We Read vs. What We Can&apos;t Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-brand">What we read</span>
              </div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-start gap-2"><span className="text-brand mt-0.5">&#10003;</span>Subscriptions &amp; their status</li>
                <li className="flex items-start gap-2"><span className="text-brand mt-0.5">&#10003;</span>Invoices &amp; payment history</li>
                <li className="flex items-start gap-2"><span className="text-brand mt-0.5">&#10003;</span>Coupons &amp; discount details</li>
                <li className="flex items-start gap-2"><span className="text-brand mt-0.5">&#10003;</span>Product prices (current vs. old)</li>
                <li className="flex items-start gap-2"><span className="text-brand mt-0.5">&#10003;</span>Card expiry dates (not numbers)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-sm font-semibold text-danger">What we can&apos;t do</span>
              </div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-start gap-2"><span className="text-danger mt-0.5">&#10007;</span>Create charges or modify billing</li>
                <li className="flex items-start gap-2"><span className="text-danger mt-0.5">&#10007;</span>Cancel or change subscriptions</li>
                <li className="flex items-start gap-2"><span className="text-danger mt-0.5">&#10007;</span>Access credit card numbers</li>
                <li className="flex items-start gap-2"><span className="text-danger mt-0.5">&#10007;</span>Delete any data from your account</li>
                <li className="flex items-start gap-2"><span className="text-danger mt-0.5">&#10007;</span>Store your API key after the scan</li>
                <li className="flex items-start gap-2"><span className="text-danger mt-0.5">&#10007;</span>Access or store customer full names</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Mode */}
        <div className="mb-16 rounded-xl border border-brand/20 bg-brand/5 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Privacy Mode</h2>
            <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs font-bold text-brand">NEW</span>
          </div>
          <p className="text-text-muted mb-6">
            For teams with strict data policies, Privacy Mode adds an extra layer of protection.
            When enabled from your dashboard settings:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-text-muted">
              <span className="text-brand mt-0.5">&#10003;</span>
              Customer emails are hidden from all reports and leak cards
            </li>
            <li className="flex items-start gap-2 text-sm text-text-muted">
              <span className="text-brand mt-0.5">&#10003;</span>
              Customer IDs are anonymized in exports (CSV, JSON, PDF)
            </li>
            <li className="flex items-start gap-2 text-sm text-text-muted">
              <span className="text-brand mt-0.5">&#10003;</span>
              Recovery actions still work &mdash; customer data is encrypted and only decrypted server-side
            </li>
            <li className="flex items-start gap-2 text-sm text-text-muted">
              <span className="text-brand mt-0.5">&#10003;</span>
              Customer names are never fetched from billing APIs in any mode
            </li>
          </ul>
          <p className="text-xs text-text-dim">
            Available for Pro and Team plans. Enable it in Dashboard &rarr; Settings &rarr; Privacy Mode.
          </p>
        </div>

        {/* Technical security details */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Technical Security Details</h2>
          <div className="space-y-4">
            {[
              { label: "Transport", detail: "All data in transit is encrypted via TLS 1.3." },
              { label: "Storage Encryption", detail: "API keys for auto-scan are encrypted at rest using AES-256-GCM with a derived key. The encryption key is stored separately from the database." },
              { label: "Database", detail: "Supabase (PostgreSQL) with Row Level Security — each user can only access their own data." },
              { label: "Hosting", detail: "Vercel with automatic HTTPS, DDoS protection, and edge network." },
              { label: "Authentication", detail: "Passwords are hashed. Only essential cookies are used — no advertising or third-party tracking cookies." },
              { label: "Data Minimization", detail: "RevReclaim only fetches the billing data needed for leak detection: subscriptions, invoices, customers. It does not access payment method details, bank accounts, or personal identity documents." },
              { label: "Customer Privacy", detail: "Customer names are never fetched from billing APIs. Emails are masked (j***@example.com) in the UI and encrypted with AES-256-GCM in the database. Privacy Mode hides all PII from the dashboard and exports." },
              { label: "Third Parties", detail: "Only Vercel (hosting) and Supabase (database), both under strict data processing agreements. RevReclaim does not sell, rent, or share your data." },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 rounded-xl border border-border bg-surface p-5">
                <div className="shrink-0 w-40">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
                <p className="text-sm text-text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What if my key is compromised? */}
        <div className="mb-16 rounded-xl border border-brand/20 bg-brand/5 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">What if my key is compromised?</h2>
          <p className="text-text-muted mb-6">
            Fair question. Here&apos;s why a read-only restricted key has minimal risk even in a worst-case scenario:
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">1</span>
              <p className="text-sm text-text-muted">
                <span className="text-white font-medium">Read-only keys cannot create charges, modify subscriptions, or access card numbers.</span>{" "}
                This is enforced at the platform level by Stripe, Paddle, and Polar. Even if someone had your key, they could only view the same data categories you granted permission for.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">2</span>
              <p className="text-sm text-text-muted">
                <span className="text-white font-medium">You can revoke any API key instantly.</span>{" "}
                Go to your Stripe, Paddle, or Polar dashboard &rarr; API Keys &rarr; delete the key. Access is cut off immediately.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">3</span>
              <p className="text-sm text-text-muted">
                <span className="text-white font-medium">One-time scan keys exist for ~90 seconds only.</span>{" "}
                They&apos;re processed in memory and never touch a database or log. After the scan completes, the key is gone.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-bold">4</span>
              <p className="text-sm text-text-muted">
                <span className="text-white font-medium">Auto-scan keys are encrypted with AES-256-GCM.</span>{" "}
                The encryption key is stored separately from the database. You can delete your stored key at any time from your dashboard settings.
              </p>
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Security FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Why not use OAuth instead of API keys?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Stripe, Paddle, and Polar each handle authentication differently. Stripe Connect (OAuth) is designed for platforms that manage billing on behalf of others &mdash; not for read-only scanning tools. Restricted API keys are the recommended way to grant scoped, read-only access. They give you full control over exactly which permissions to grant and can be revoked instantly.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Do you have SOC 2 certification?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Not yet. RevReclaim is a bootstrapped product built by a small team. We follow security best practices (encryption at rest and in transit, data minimization, zero key storage for one-time scans), but we haven&apos;t undergone a formal SOC 2 audit. We&apos;re transparent about this because we believe honesty builds more trust than vague claims.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Can I revoke access at any time?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Yes. For one-time scans, there&apos;s nothing to revoke &mdash; the key is already gone. For auto-scan, you can delete the stored key from your RevReclaim dashboard settings, or revoke the key directly from your billing platform&apos;s API keys page. Access is cut off immediately.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Who can see my billing data?</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Only you. Your scan reports and dashboard are protected by Row Level Security in the database &mdash; each user can only access their own data. The RevReclaim team does not access customer billing data.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to scan?</h3>
          <p className="text-sm text-text-muted mb-6">
            Free forever. Read-only access. Key never stored.
          </p>
          <Link
            href="/scan"
            className="inline-block rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Scan My Billing &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
