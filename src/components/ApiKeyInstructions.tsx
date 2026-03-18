"use client";

import { useState } from "react";
import Image from "next/image";
import type { BillingPlatform } from "@/lib/platforms/types";
import { PLATFORM_LABELS } from "@/lib/platforms/types";

interface StepConfig {
  number: string;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
  permissions?: string[];
  optionalPermissions?: string[];
  image?: string;
  imageAlt?: string;
}

const PLATFORM_STEPS: Record<BillingPlatform, StepConfig[]> = {
  stripe: [
    {
      number: "1",
      title: "Go to Developers → API Keys",
      description:
        'Open your Stripe Dashboard and navigate to Developers → API Keys. Click "Create restricted key" at the bottom.',
      link: "https://dashboard.stripe.com/apikeys",
      linkLabel: "Open Stripe API Keys →",
      image: "/images/api-key-guide/step-1-api-keys-page.png",
      imageAlt:
        "Stripe Developers page showing API Keys section with Create restricted key button",
    },
    {
      number: "2",
      title: 'Select "Providing this key to another website"',
      description:
        "In the dialog, choose the second option — you're giving this key to RevReclaim to read your billing data.",
      image: "/images/api-key-guide/step-2-create-restricted-key.png",
      imageAlt:
        'Create restricted key dialog with "Providing this key to another website" selected',
    },
    {
      number: "3",
      title: "Name it & add our URL",
      description:
        'Enter "RevReclaim" as the key name and https://revreclaim.com as the URL. Then check "Customize permissions for this key".',
      image: "/images/api-key-guide/step-3-fill-details.png",
      imageAlt:
        "Filling in RevReclaim as key name and revreclaim.com as URL",
    },
    {
      number: "4",
      title: "Set permissions to Read",
      description:
        'Scroll through the permissions list and set each of these to "Read":',
      permissions: [
        "Subscriptions",
        "Invoices",
        "Products",
        "Prices",
        "Coupons",
        "Payment Methods",
      ],
      optionalPermissions: ["Customers"],
      image: "/images/api-key-guide/step-4-set-permission.png",
      imageAlt:
        'Stripe permission row showing Subscriptions set to Read',
    },
    {
      number: "5",
      title: "Create & copy your key",
      description:
        'Click "Create key", then click the key to copy it. Paste it above and you\'re done.',
      image: "/images/api-key-guide/step-6-copy-key.png",
      imageAlt:
        "Newly created restricted API key with Click to copy button",
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
  const [isOpen, setIsOpen] = useState(true);
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
        <span className="text-[10px] text-text-muted font-normal ml-1">(takes 60 seconds)</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-1 bg-surface rounded-xl p-5 border border-border">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {/* Connector line between steps */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[13px] top-7 bottom-0 w-px bg-brand/10" />
              )}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-brand">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pb-5">
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
                      {step.optionalPermissions?.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white/5 text-text-muted rounded border border-border"
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
                          <span className="text-[10px] opacity-70">(optional)</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {step.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-border/50">
                      <Image
                        src={step.image}
                        alt={step.imageAlt || step.title}
                        width={800}
                        height={400}
                        className="w-full h-auto"
                        quality={90}
                      />
                    </div>
                  )}
                </div>
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
              <span className="text-white font-medium">
                Read-only access
              </span>{" "}
              &mdash; We can&apos;t modify your {platformLabel} account.
              Your key is never stored.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
