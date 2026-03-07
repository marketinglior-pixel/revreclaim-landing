import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact RevReclaim | Support & Enterprise Inquiries",
  description:
    "Get in touch with RevReclaim. Questions about pricing, enterprise plans, or need help with your scan? We respond within 24 hours.",
  alternates: { canonical: "https://revreclaim.com/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
