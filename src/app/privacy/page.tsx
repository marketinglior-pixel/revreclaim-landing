import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | RevReclaim",
  description: "How RevReclaim handles your data, Stripe API keys, and scan results.",
};

export default function PrivacyPage() {
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
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-text-muted mb-12">Last updated: March 5, 2026</p>

        <div className="space-y-10 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. What We Collect</h2>
            <p className="mb-3">When you use RevReclaim, we collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li><span className="text-text-secondary">Account information:</span> Email address, name, and password (hashed) when you create an account.</li>
              <li><span className="text-text-secondary">Stripe API keys:</span> Read-only restricted keys you provide for scanning. One-time scan keys are never stored. Auto-scan keys are encrypted with AES-256-GCM before storage.</li>
              <li><span className="text-text-secondary">Scan results:</span> Revenue leak reports generated from your Stripe data, stored in your account for future reference.</li>
              <li><span className="text-text-secondary">Usage data:</span> Basic analytics like page views and feature usage to improve the product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Handle Your Stripe Data</h2>
            <p className="mb-3">Your Stripe security is our top priority:</p>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li><span className="text-text-secondary">Read-only access:</span> We only request read-only Stripe API keys. We cannot modify your Stripe account, create charges, or change subscriptions.</li>
              <li><span className="text-text-secondary">One-time scans:</span> API keys used for manual scans are processed in memory and never stored on any server or database.</li>
              <li><span className="text-text-secondary">Auto-scan keys:</span> If you enable automated weekly scans, your API key is encrypted using AES-256-GCM with a derived key before storage. The encryption key is stored separately from the database.</li>
              <li><span className="text-text-secondary">Data minimization:</span> We only fetch the Stripe data needed for leak detection (subscriptions, invoices, customers). We do not access payment method details, bank accounts, or personal identity documents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>Generate revenue leak reports for your review</li>
              <li>Store scan history in your dashboard</li>
              <li>Run automated scans on your chosen schedule</li>
              <li>Send scan completion notifications (if enabled)</li>
              <li>Improve our leak detection algorithms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage & Security</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li><span className="text-text-secondary">Database:</span> Data is stored in Supabase (PostgreSQL) with Row Level Security — each user can only access their own data.</li>
              <li><span className="text-text-secondary">Encryption:</span> API keys are encrypted at rest using AES-256-GCM. All data in transit is encrypted via TLS 1.3.</li>
              <li><span className="text-text-secondary">Hosting:</span> The application is hosted on Vercel with automatic HTTPS and DDoS protection.</li>
              <li><span className="text-text-secondary">Access control:</span> Only you can access your reports and settings. Our team does not access customer Stripe data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Sharing</h2>
            <p className="mb-3">We do not sell, rent, or share your personal data or Stripe data with third parties, except:</p>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li><span className="text-text-secondary">Infrastructure providers:</span> Vercel (hosting), Supabase (database) — under strict data processing agreements.</li>
              <li><span className="text-text-secondary">Legal requirements:</span> If required by law, court order, or government request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention & Deletion</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>Scan reports are retained as long as your account is active.</li>
              <li>You can delete individual reports from your dashboard at any time.</li>
              <li>You can delete your auto-scan configuration (including the encrypted API key) at any time.</li>
              <li>To delete your entire account and all associated data, contact us at the email below.</li>
              <li>Upon account deletion, all data is permanently removed within 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
            <p className="text-text-muted">
              We use essential cookies only — for authentication sessions and security. We do not use advertising cookies or third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>Access your stored data</li>
              <li>Export your scan reports</li>
              <li>Delete your data and account</li>
              <li>Withdraw consent for automated scans at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes</h2>
            <p className="text-text-muted">
              We may update this policy from time to time. Material changes will be communicated via email to registered users. Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p className="text-text-muted">
              For privacy-related questions or data deletion requests, contact us at{" "}
              <a href="mailto:revreclaim@gmail.com" className="text-brand hover:text-brand-light transition">
                revreclaim@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
