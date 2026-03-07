"use client";

import { useState } from "react";
import type { BillingPlatform } from "@/lib/platforms/types";
import { PLATFORM_LABELS } from "@/lib/platforms/types";

interface StepConfig {
  number: string;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
  permissions?: string[];
}

const PLATFORM_STEPS: Record<BillingPlatform, StepConfig[]> = {
  stripe: [
    {
      number: "1",
      title: "Open Stripe Dashboard",
      description: "Go to Stripe \u2192 Developers \u2192 API Keys",
      link: "https://dashboard.stripe.com/apikeys",
      linkLabel: "Open Stripe Dashboard \u2192",
    },
    {
      number: "2",
      title: "Create Restricted Key",
      description: 'Click "Create restricted key" at the bottom of the page',
    },
    {
      number: "3",
      title: "Enable Read Permissions",
      description: "Set these to Read access:",
      permissions: [
        "Customers",
        "Subscriptions",
        "Invoices",
        "Products",
        "Prices",
        "Coupons",
        "Payment Methods",
      ],
    },
    {
      number: "4",
      title: "Copy Your Key",
      description:
        'Click "Create key" and copy the key starting with rk_live_',
    },
  ],
  polar: [
    {
      number: "1",
      title: "Open Polar Dashboard",
      description: "Go to Polar.sh and navigate to Settings",
      link: "https://polar.sh/settings",
      linkLabel: "Open Polar Settings \u2192",
    },
    {
      number: "2",
      title: "Create Access Token",
      description:
        'Go to "Access Tokens" and click "Create Token"',
    },
    {
      number: "3",
      title: "Set Read Permissions",
      description: "Enable read access for:",
      permissions: [
        "Subscriptions",
        "Customers",
        "Orders",
        "Discounts",
        "Products",
      ],
    },
    {
      number: "4",
      title: "Copy Your Token",
      description: "Copy the token starting with polar_oat_",
    },
  ],
  lemonsqueezy: [
    {
      number: "1",
      title: "Open Lemon Squeezy Dashboard",
      description: "Go to Settings \u2192 API",
      link: "https://app.lemonsqueezy.com/settings/api",
      linkLabel: "Open Lemon Squeezy API Settings \u2192",
    },
    {
      number: "2",
      title: "Generate API Key",
      description: 'Click "+" to generate a new API key. Lemon Squeezy keys have full access — we only use yours to read data.',
    },
    {
      number: "3",
      title: "Copy & Paste Your Key",
      description: "Copy the full API key. After your scan, we recommend revoking it from your dashboard.",
    },
  ],
  paddle: [
    {
      number: "1",
      title: "Open Paddle Dashboard",
      description: "Go to Developer Tools \u2192 Authentication",
      link: "https://vendors.paddle.com/authentication",
      linkLabel: "Open Paddle Dashboard \u2192",
    },
    {
      number: "2",
      title: "Generate API Key",
      description: "Create a new API key with read permissions",
    },
    {
      number: "3",
      title: "Copy Your Key",
      description: "Copy the API key",
    },
  ],
};

interface ApiKeyInstructionsProps {
  platform?: BillingPlatform;
}

export default function ApiKeyInstructions({
  platform = "stripe",
}: ApiKeyInstructionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const steps = PLATFORM_STEPS[platform];
  const platformLabel = PLATFORM_LABELS[platform];

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-brand hover:text-brand-light transition-colors cursor-pointer"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        How do I get my API key?
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 bg-surface rounded-xl p-5 border border-border">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                <span className="text-xs font-bold text-brand">
                  {step.number}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {step.title}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {step.description}
                </p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-light mt-1"
                  >
                    {step.linkLabel || `Open ${platformLabel} Dashboard \u2192`}
                  </a>
                )}
                {step.permissions && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {step.permissions.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-brand/10 text-brand rounded border border-brand/20"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
            <svg
              className="w-4 h-4 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs text-text-muted">
              {platform === "lemonsqueezy" ? (
                <>
                  <span className="text-white font-medium">We only read your data</span>{" "}
                  &mdash; We never modify your {platformLabel} account.
                  Since Lemon Squeezy doesn&apos;t support restricted keys, we recommend revoking the key after your scan.
                </>
              ) : (
                <>
                  <span className="text-white font-medium">Read-only access</span>{" "}
                  &mdash; We can only read data. We can&apos;t modify your {platformLabel} account.
                  Your key is never stored.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
