const testimonials = [
  {
    quote:
      "We found $3,200/month in expired coupons that nobody noticed. One scan, 2 minutes. That's $38K/year we were just… giving away.",
    name: "Sarah M.",
    role: "Co-founder",
    company: "CloudMetrics",
    mrr: "$85K MRR",
    recovered: "$3,200/mo recovered",
  },
  {
    quote:
      "14 ghost subscriptions sitting in 'past_due' for months. I had no idea Stripe doesn't flag these automatically. Fixed them all in one afternoon.",
    name: "James K.",
    role: "Head of Revenue",
    company: "DataPulse",
    mrr: "$120K MRR",
    recovered: "$2,100/mo recovered",
  },
  {
    quote:
      "We raised prices 8 months ago but 40% of customers were still on old plans. RevReclaim found every single one. Migration was painless.",
    name: "Alex R.",
    role: "Founder & CEO",
    company: "ShipFast",
    mrr: "$45K MRR",
    recovered: "$1,800/mo recovered",
  },
];

const stats = [
  { value: "$2.1M+", label: "Revenue leaks identified" },
  { value: "94%", label: "Of accounts have leaks" },
  { value: "$2,340", label: "Avg. monthly recovery" },
  { value: "< 2 min", label: "Average scan time" },
];

export function SocialProof() {
  return (
    <section className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          Results
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          SaaS founders are recovering thousands
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-[#999]">
          Real results from real scans. Every number below came from a 2-minute audit.
        </p>

        {/* Stats bar */}
        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5 text-center"
            >
              <div className="text-2xl font-bold text-white md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-[#999]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] p-6 transition-all hover:border-[#10B981]/20"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 text-[#F59E0B]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-[#CCC]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="border-t border-[#1A1A1A] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-[#999]">
                      {t.role}, {t.company}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#10B981]">{t.recovered}</div>
                    <div className="text-xs text-[#999]">{t.mrr}</div>
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
