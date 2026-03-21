"use client";

// ────────────────────────────────────────────────────────
// Security Strip — glass morphism trust bar after Hero
// ────────────────────────────────────────────────────────

const securityPoints = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Read-Only API Key",
    desc: "We can only view data. Zero write access to your billing.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "AES-256 Encryption",
    desc: "Your data is encrypted in transit and at rest.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: "Key Deleted After Scan",
    desc: "Your API key is permanently deleted once the scan completes.",
  },
];

export function SecurityStrip() {
  return (
    <section className="relative py-8">
      {/* Gradient divider top */}
      <div className="section-divider" />

      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {securityPoints.map((point) => (
            <div
              key={point.title}
              className="flex items-start gap-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] px-5 py-4 transition-all duration-300 hover:border-brand/10 hover:bg-brand/[0.02]"
            >
              <div className="flex-shrink-0 mt-0.5 text-brand/60 transition-colors duration-300 group-hover:text-brand">
                {point.icon}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white/90">{point.title}</div>
                <div className="text-xs text-white/35 leading-relaxed mt-0.5">{point.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <a href="/security" className="text-[11px] text-white/25 hover:text-brand transition-colors duration-300 font-medium tracking-wide">
            Read our full security policy &rarr;
          </a>
        </div>
      </div>

      {/* Gradient divider bottom */}
      <div className="section-divider" />
    </section>
  );
}
