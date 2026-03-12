import Link from "next/link";

export function SecuritySection() {
  return (
    <section id="security" className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
          Security
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Your API key gets less access than a junior developer.
        </h2>
        <p className="mb-16 max-w-2xl text-lg text-text-muted">
          We designed it that way. The key you create is restricted to read operations only.
          Enforced by Stripe, Paddle, and Polar at the platform level. Not a promise. A technical limitation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Read-Only */}
          <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mb-4">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Nothing changes in your billing. Ever.</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              The API key you create is restricted to read operations. RevReclaim cannot create charges,
              modify subscriptions, or cancel anything. This is enforced by the platform. It&apos;s technically impossible.
            </p>
          </div>

          {/* Key Never Stored */}
          <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mb-4">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">We delete your key after the scan.</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Your key is processed in memory during the scan and discarded immediately after.
              Never written to a database, never logged, never visible to our team. The scan takes 90 seconds.
              That&apos;s how long your key exists.
            </p>
          </div>

          {/* Encrypted */}
          <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mb-4">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Even our own team can&apos;t see your data.</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              TLS 1.3 in transit. AES-256-GCM at rest (for auto-scan users only).
              Row Level Security in the database. Basically, your data is in a vault even we can&apos;t open.
            </p>
          </div>

          {/* Customer Names Never Stored */}
          <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mb-4">
              <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Your customers stay anonymous. Always.</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              RevReclaim never pulls customer names from your billing platform. Only masked emails and anonymized IDs.
              Enable Privacy Mode to hide all identifying data from the dashboard and exports.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/security"
            className="text-sm text-brand hover:text-brand-light underline underline-offset-2 transition"
          >
            Read the full security breakdown &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
