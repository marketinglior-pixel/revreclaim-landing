"use client";

import { useSectionView } from "@/hooks/useSectionView";

const obstacles = [
  {
    question: "Is my API key safe?",
    answer: "Read-only. Deleted after scan. Platform-enforced. Gets less access than a junior developer.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    question: "I don't have time for this",
    answer: "90 seconds. Less time than reading this section.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    question: "My billing is probably fine",
    answer: "94% of scans find leaks. The other 6% sleep better knowing.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    question: "I don't know how to create an API key",
    answer: "4 clicks. 60 seconds. We show you exactly how. 847+ founders managed it.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    question: "What if they find nothing?",
    answer: "Then you get a clean bill of health. Worth 90 seconds?",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    question: "I'll just audit manually",
    answer: "Manual audit: 4-6 hours. RevReclaim: 90 seconds. We also catch 40% more leaks.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    question: "I'm too small for this",
    answer: "Works for 50+ customers. Below that, you probably know every customer by name.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    question: "What happens with my data?",
    answer: "AES-256 encryption. Key in memory only. Deleted immediately. No card numbers ever touched.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export function ObstacleSection() {
  const sectionRef = useSectionView("obstacles");

  return (
    <section ref={sectionRef} className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
          Objections answered
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Every reason not to scan.{" "}
          <span className="text-text-muted">Answered.</span>
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-lg text-text-muted">
          We get these a lot. Here you go.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {obstacles.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-brand/20"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-light text-text-muted">
                  {item.icon}
                </div>
                <p className="text-sm italic text-text-muted">&ldquo;{item.question}&rdquo;</p>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#faq"
            className="text-sm text-text-dim hover:text-brand transition-colors"
          >
            Still skeptical? Good. Read the full FAQ &darr;
          </a>
        </div>
      </div>
    </section>
  );
}
