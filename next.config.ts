import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevent clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevent MIME-type sniffing
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains", // Force HTTPS for 1 year
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // Disable unnecessary APIs
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://polar.sh", // Next.js needs inline scripts
              "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
              "img-src 'self' data: blob: https://*.polar.sh",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.polar.sh https://*.polar.sh https://*.sentry.io",
              "frame-src 'self' https://*.polar.sh",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "revreclaim",
  project: "revreclaim-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
