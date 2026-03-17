"use client";

import { Leak } from "@/lib/types";
import { LEAK_ACTION_BUCKET, ActionBucket } from "@/lib/leak-categories";
import { formatCurrency } from "@/lib/utils";

interface QuickWinsProps {
  leaks: Leak[];
}

const BUCKET_CONFIG: Record<
  ActionBucket,
  { title: string; subtitle: string; icon: React.ReactNode; color: string; bgColor: string; tagBg: string; tagText: string; tagBorder: string }
> = {
  fix_in_stripe: {
    title: "Fix Now in Stripe",
    subtitle: "One-click fixes in your dashboard",
    color: "text-brand",
    bgColor: "bg-brand/10",
    tagBg: "bg-brand/10",
    tagText: "text-brand",
    tagBorder: "border-brand/20",
    icon: (
      <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  email_customer: {
    title: "Email Your Customers",
    subtitle: "Send a payment reminder or card update request",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    tagBg: "bg-amber-400/10",
    tagText: "text-amber-400",
    tagBorder: "border-amber-400/20",
    icon: (
      <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  pricing_decision: {
    title: "Needs Pricing Decision",
    subtitle: "Review and decide on pricing changes",
    color: "text-info",
    bgColor: "bg-info/10",
    tagBg: "bg-info/10",
    tagText: "text-info",
    tagBorder: "border-info/20",
    icon: (
      <svg className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
  },
};

const BUCKET_ORDER: ActionBucket[] = ["fix_in_stripe", "email_customer", "pricing_decision"];

export default function QuickWins({ leaks }: QuickWinsProps) {
  if (leaks.length === 0) return null;

  const buckets = BUCKET_ORDER.map((bucket) => {
    const items = leaks.filter((l) => LEAK_ACTION_BUCKET[l.type] === bucket);
    const mrr = items.reduce(
      (sum, l) => sum + Math.round(l.monthlyImpact * l.recoveryRate),
      0
    );
    return { bucket, items, mrr };
  }).filter((b) => b.items.length > 0);

  if (buckets.length === 0) return null;

  const gridCols =
    buckets.length === 1
      ? "grid-cols-1"
      : buckets.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-4 animate-fade-in-up`}>
      {buckets.map(({ bucket, items, mrr }) => {
        const config = BUCKET_CONFIG[bucket];
        return (
          <div
            key={bucket}
            className={`bg-surface border ${bucket === "fix_in_stripe" ? "border-brand/20" : "border-border"} rounded-xl p-5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bgColor}`}>
                {config.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {config.title}
                </h3>
                <p className="text-[10px] text-text-dim">{config.subtitle}</p>
              </div>
            </div>
            <p className={`text-2xl font-bold ${config.color}`}>
              {items.length}{" "}
              <span className="text-sm font-medium text-text-muted">
                {items.length === 1 ? "leak" : "leaks"} → {formatCurrency(mrr)}/mo
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from(new Set(items.map((l) => l.type))).map((type) => {
                const count = items.filter((l) => l.type === type).length;
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium ${config.tagBg} ${config.tagText} rounded border ${config.tagBorder}`}
                  >
                    {count}x {type.replace(/_/g, " ")}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
