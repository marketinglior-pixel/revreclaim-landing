import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | RevReclaim",
  description: "Terms and conditions for using the RevReclaim revenue leak detection service.",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-text-muted mb-12">Last updated: March 8, 2026</p>

        <div className="space-y-10 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Service Overview</h2>
            <p className="text-text-muted">
              RevReclaim (&quot;the Service&quot;) is a SaaS tool that scans your Stripe, Paddle, or Polar billing account to detect revenue leaks — failed payments, stuck subscriptions, pricing mismatches, and other billing issues that cost you money. The Service is provided by RevReclaim (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
            <p className="text-text-muted">
              You must be at least 18 years old and have the authority to grant read-only access to the billing account you are scanning (Stripe, Paddle, or Polar). By using RevReclaim, you confirm that you are the authorized owner or administrator of the billing account and that you have the legal right to access and analyze the data provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account & Access</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide a valid email address for account registration.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>You must notify us immediately of any unauthorized access to your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. API Keys</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>You must only provide <span className="text-text-secondary">read-only restricted API keys</span>. Never share your secret key or a key with write permissions.</li>
              <li>For one-time scans, your API key is used in memory only and is not stored on any server or database.</li>
              <li>For automated scans, your API key is encrypted with AES-256-GCM before storage. The encryption key is stored separately. You can delete it at any time from your settings.</li>
              <li>We access your billing data exclusively for the purpose of generating revenue leak reports. We do not make any modifications to your billing account.</li>
              <li>Read-only access limitations are enforced at the platform level by Stripe, Paddle, and Polar respectively — RevReclaim cannot create charges, modify subscriptions, or delete data even if it attempted to.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>Use the Service to scan billing accounts you do not own or have authorization to access.</li>
              <li>Attempt to reverse engineer, decompile, or extract source code from the Service.</li>
              <li>Use automated scripts to abuse API endpoints or circumvent rate limits.</li>
              <li>Share your account access with unauthorized third parties.</li>
              <li>Use the Service for any illegal purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Scan Results & Accuracy</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>Scan reports are generated based on automated analysis of your billing data at the time of scanning.</li>
              <li>Revenue estimates (MRR at risk, annual recovery) are <span className="text-text-secondary">approximate projections</span>, not guaranteed recovery amounts.</li>
              <li>We recommend reviewing each identified leak manually before taking action.</li>
              <li>RevReclaim is a diagnostic tool — we identify issues but do not automatically fix them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Pricing & Plans</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>The free plan includes limited scan functionality.</li>
              <li>Paid plans provide additional features such as unlimited scans, automated weekly scans, and priority support.</li>
              <li>Prices are subject to change with 30 days notice to existing subscribers.</li>
              <li>Refunds are handled on a case-by-case basis within 14 days of purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Security Measures</h2>
            <p className="text-text-muted mb-3">
              We implement commercially reasonable security measures to protect your data, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li><span className="text-text-secondary">Encryption in transit:</span> All data transmitted between your browser and our servers is encrypted using TLS 1.3.</li>
              <li><span className="text-text-secondary">Encryption at rest:</span> Stored API keys (for auto-scan users) are encrypted using AES-256-GCM with derived keys stored separately from the database.</li>
              <li><span className="text-text-secondary">Database isolation:</span> Row Level Security (RLS) ensures each user can only access their own data.</li>
              <li><span className="text-text-secondary">Minimal data retention:</span> One-time scan API keys are processed in memory and never written to persistent storage.</li>
              <li><span className="text-text-secondary">Infrastructure:</span> Hosted on Vercel with automatic HTTPS, DDoS protection, and SOC 2 compliant infrastructure. Database hosted on Supabase with SOC 2 Type II certification.</li>
            </ul>
            <p className="text-text-muted mt-3">
              While we implement commercially reasonable security measures, no system is 100% secure. We do not warrant or guarantee the absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Breach Notification</h2>
            <p className="text-text-muted mb-3">
              In the event of a confirmed security breach that compromises your personal data or API keys, we will:
            </p>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>Notify affected users via email within <span className="text-text-secondary">72 hours</span> of confirming the breach.</li>
              <li>Provide a description of the nature of the breach, the data affected, and the measures taken to address and mitigate it.</li>
              <li>Report to relevant data protection authorities as required by applicable law (including GDPR where applicable).</li>
              <li>Provide guidance on steps you can take to protect yourself, including revoking and regenerating API keys on your billing platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Indemnification</h2>
            <p className="text-text-muted">
              You agree to indemnify, defend, and hold harmless RevReclaim and its officers, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising out of or related to: (a) your use of the Service; (b) your provision of API keys for billing accounts you do not own or are not authorized to access; (c) your provision of API keys with permissions beyond read-only access; (d) your violation of these Terms; or (e) your violation of any rights of a third party. You are solely responsible for ensuring that the API keys you provide are appropriately scoped to read-only access as instructed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Limitation of Liability</h2>
            <p className="text-text-muted">
              RevReclaim is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total aggregate liability is limited to the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) $100 USD. We are not responsible for any revenue loss, data loss, or business interruption resulting from actions taken based on scan results. This limitation applies to all causes of action in the aggregate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Termination</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted">
              <li>You may close your account at any time by contacting us.</li>
              <li>We may suspend or terminate accounts that violate these terms.</li>
              <li>Upon termination, your data will be deleted within 30 days per our Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Governing Law</h2>
            <p className="text-text-muted">
              These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Israel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Changes to Terms</h2>
            <p className="text-text-muted">
              We may update these terms from time to time. Material changes will be communicated via email at least 14 days before they take effect. Continued use of the Service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">15. Contact</h2>
            <p className="text-text-muted">
              For questions about these terms, contact us at{" "}
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
