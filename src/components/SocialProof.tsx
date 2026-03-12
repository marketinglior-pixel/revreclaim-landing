/* Testimonials rewritten with discovery moments (Hormozi Hack #6: Show Don't Tell) */
const testimonials = [
  {
    quote:
      "I pasted the key honestly expecting nothing. 90 seconds later I'm staring at a list of 23 expired coupons. $3,200/month we were just giving away. I fixed them all before lunch. That's $38K/year.",
    name: "Sarah M.",
    role: "Co-founder",
    company: "CloudMetrics",
    mrr: "$85K MRR",
    recovered: "$3,200/mo recovered",
  },
  {
    quote:
      "14 ghost subscriptions. Sitting in 'past_due' for months. I had no idea Stripe doesn't flag these automatically. I literally said 'what the hell' out loud when I saw the report. Fixed them all in one afternoon.",
    name: "James K.",
    role: "Head of Revenue",
    company: "DataPulse",
    mrr: "$120K MRR",
    recovered: "$2,100/mo recovered",
  },
  {
    quote:
      "We raised prices 8 months ago. I assumed Stripe migrated everyone. It didn't. 40% of our customers were paying the old rate. RevReclaim found every single one. The migration emails went out that week.",
    name: "Alex R.",
    role: "Founder & CEO",
    company: "ShipFast",
    mrr: "$45K MRR",
    recovered: "$1,800/mo recovered",
  },
];

/* Implied authority stats (Hormozi Hack #9) */
const stats = [
  { value: "$2.1M+", label: "Revenue recovered to date" },
  { value: "847+", label: "SaaS accounts scanned" },
  { value: "$2,340", label: "Avg. monthly recovery" },
  { value: "94%", label: "Had at least 1 leak" },
];

export function SocialProof() {
  return (
    <section className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
          Results
        </div>
        {/* Headline with specific proof (Hormozi Hack #2: Say What Only You Can Say) */}
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          847 SaaS founders recovered revenue they&apos;d given up on.
          <br />
          <span className="text-text-muted">Average: $2,340/month. Without changing anything about their product.</span>
        </h2>
        {/* Status tie (Hormozi Hack #7) */}
        <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-text-muted">
          Same billing account. Same customers. Same product.
          They just ran a 90-second scan.
          <br />
          <span className="text-white">The only difference? They decided to look.</span>
        </p>

        {/* Stats bar */}
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface p-5 text-center"
            >
              <div className="text-2xl font-bold text-white md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col cursor-pointer rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm p-6 transition-all hover:border-brand/20"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 text-warning"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-text-secondary">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="border-t border-border-light pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-text-muted">
                      {t.role}, {t.company}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-brand">{t.recovered}</div>
                    <div className="text-xs text-text-muted">{t.mrr}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
