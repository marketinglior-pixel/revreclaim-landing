import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | RevReclaim",
  description: "Terms and conditions for using the RevReclaim revenue leak detection service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">RevReclaim</span>
          </Link>
          <Link href="/" className="text-sm text-[#999] hover:text-white transition">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-[#666] mb-12">Last updated: March 5, 2026</p>

        <div className="space-y-10 text-[#ccc] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Service Overview</h2>
            <p className="text-[#999]">
              RevReclaim (&quot;the Service&quot;) is a SaaS tool that scans your Stripe account to detect revenue leaks — failed payments, ghost subscriptions, pricing mismatches, and other billing issues that cost you money. The Service is provided by RevReclaim (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
            <p className="text-[#999]">
              You must be at least 18 years old and have the authority to grant read-only access to the Stripe account you are scanning. By using RevReclaim, you confirm that you are authorized to access and analyze the Stripe data provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account & Access</h2>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide a valid email address for account registration.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>You must notify us immediately of any unauthorized access to your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Stripe API Keys</h2>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>You must only provide <span className="text-[#ccc]">read-only restricted API keys</span>. Never share your Stripe secret key.</li>
              <li>For one-time scans, your API key is used in memory only and is not stored.</li>
              <li>For automated scans, your API key is encrypted with AES-256-GCM before storage. You can delete it at any time from your settings.</li>
              <li>We access your Stripe data exclusively for the purpose of generating revenue leak reports. We do not make any modifications to your Stripe account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>Use the Service to scan Stripe accounts you do not own or have authorization to access.</li>
              <li>Attempt to reverse engineer, decompile, or extract source code from the Service.</li>
              <li>Use automated scripts to abuse API endpoints or circumvent rate limits.</li>
              <li>Share your account access with unauthorized third parties.</li>
              <li>Use the Service for any illegal purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Scan Results & Accuracy</h2>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>Scan reports are generated based on automated analysis of your Stripe data at the time of scanning.</li>
              <li>Revenue estimates (MRR at risk, annual recovery) are <span className="text-[#ccc]">approximate projections</span>, not guaranteed recovery amounts.</li>
              <li>We recommend reviewing each identified leak manually before taking action.</li>
              <li>RevReclaim is a diagnostic tool — we identify issues but do not automatically fix them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Pricing & Plans</h2>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>The free plan includes limited scan functionality.</li>
              <li>Paid plans provide additional features such as unlimited scans, automated weekly scans, and priority support.</li>
              <li>Prices are subject to change with 30 days notice to existing subscribers.</li>
              <li>Refunds are handled on a case-by-case basis within 14 days of purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="text-[#999]">
              RevReclaim is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months preceding the claim. We are not responsible for any revenue loss, data loss, or business interruption resulting from actions taken based on scan results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
            <ul className="list-disc list-inside space-y-2 text-[#999]">
              <li>You may close your account at any time by contacting us.</li>
              <li>We may suspend or terminate accounts that violate these terms.</li>
              <li>Upon termination, your data will be deleted within 30 days per our Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p className="text-[#999]">
              We may update these terms from time to time. Material changes will be communicated via email at least 14 days before they take effect. Continued use of the Service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
            <p className="text-[#999]">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@revreclaim.com" className="text-[#10B981] hover:text-[#34D399] transition">
                legal@revreclaim.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
