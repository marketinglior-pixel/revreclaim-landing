import type { ReactNode } from "react";

const shieldExclamation = (
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>
);

const leakIconPaths: Record<string, ReactNode> = {
  "Failed Payments": (
    <>
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M2 10h20" />
      <path d="M15 14l4 4m0-4l-4 4" />
    </>
  ),
  "Uncollected Revenue": (
    <>
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M2 10h20" />
      <path d="M15 14l4 4m0-4l-4 4" />
    </>
  ),
  "Ghost Subscriptions": (
    <>
      <path d="M12 2a7 7 0 0 0-7 7v11l2.5-2 2.5 2 2-2 2 2 2.5-2L19 20V9a7 7 0 0 0-7-7Z" />
      <path d="M9 10h.01M15 10h.01" />
    </>
  ),
  "Expiring Cards": (
    <>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  "Expired Coupons": (
    <>
      <path d="M10 3H5a2 2 0 0 0-2 2v5l10.5 10.5a2 2 0 0 0 2.83 0l4.17-4.17a2 2 0 0 0 0-2.83L10 3Z" />
      <path d="M7 7h.01" />
      <path d="M14 11l3 3m0-3l-3 3" />
    </>
  ),
  "Forever Discounts": (
    <path d="M12 12c-1.67-3.33-3.33-5-5-5a5 5 0 0 0 0 10c1.67 0 3.33-1.67 5-5c1.67-3.33 3.33-5 5-5a5 5 0 0 1 0 10c-1.67 0-3.33-1.67-5-5" />
  ),
  "Legacy Pricing": (
    <>
      <path d="M3 7l5 5 4-4 9 9" />
      <path d="M17 17h4v-4" />
    </>
  ),
  "Missing Payment": shieldExclamation,
  "Missing Payment Methods": shieldExclamation,
};

export function LeakIcon({
  type,
  className = "h-5 w-5 text-brand",
}: {
  type: string;
  className?: string;
}) {
  const paths = leakIconPaths[type];
  if (!paths) return null;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}
