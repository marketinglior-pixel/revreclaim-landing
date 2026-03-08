import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevReclaim Blog | SaaS Billing Recovery Tips & Insights",
  description:
    "Learn how to find and fix revenue leaks in your SaaS billing. Tips for Stripe, Paddle, and Polar users on recovering failed payments, ghost subscriptions, and more.",
  alternates: { canonical: "https://revreclaim.com/blog" },
  openGraph: {
    title: "RevReclaim Blog | SaaS Billing Recovery Tips & Insights",
    description:
      "Learn how to find and fix revenue leaks in your SaaS billing. Tips for Stripe, Paddle, and Polar.",
    url: "https://revreclaim.com/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
