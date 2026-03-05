"use client";

import { useState } from "react";

const steps = [
  {
    number: "1",
    title: "Open Stripe Dashboard",
    description: 'Go to Stripe → Developers → API Keys',
    link: "https://dashboard.stripe.com/apikeys",
  },
  {
    number: "2",
    title: "Create Restricted Key",
    description:
      'Click "Create restricted key" at the bottom of the page',
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
    description: 'Click "Create key" and copy the key starting with rk_live_',
  },
];

export default function ApiKeyInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-[#10B981] hover:text-[#34D399] transition-colors cursor-pointer"
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
        <div className="mt-4 space-y-4 bg-[#111111] rounded-xl p-5 border border-[#2A2A2A]">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                <span className="text-xs font-bold text-[#10B981]">
                  {step.number}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {step.title}
                </p>
                <p className="text-xs text-[#999] mt-0.5">
                  {step.description}
                </p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#10B981] hover:text-[#34D399] mt-1"
                  >
                    Open Stripe Dashboard →
                  </a>
                )}
                {step.permissions && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {step.permissions.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#10B981]/10 text-[#10B981] rounded border border-[#10B981]/20"
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

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#2A2A2A]">
            <svg
              className="w-4 h-4 text-[#10B981]"
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
            <p className="text-xs text-[#999]">
              <span className="text-white font-medium">Read-only access</span>{" "}
              — We can only read data. We can&apos;t modify your Stripe account.
              Your key is never stored.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
