import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevReclaim Blog | SaaS Billing Recovery Tips & Insights",
  description:
    "Learn how to find and fix revenue leaks in your SaaS billing. Tips for Stripe, Paddle, and Polar users on recovering failed payments, stuck subscriptions, and more.",
  alternates: { canonical: "https://revreclaim.com/blog" },
  openGraph: {
    title: "RevReclaim Blog | SaaS Billing Recovery Tips & Insights",
    description:
      "Learn how to find and fix revenue leaks in your SaaS billing. Tips for Stripe, Paddle, and Polar.",
    url: "https://revreclaim.com/blog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevReclaim Blog — SaaS billing recovery tips and insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim Blog | SaaS Billing Recovery Tips & Insights",
    description:
      "Learn how to find and fix revenue leaks in your SaaS billing. Tips for Stripe, Paddle, and Polar.",
    images: ["/og-image.png"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
