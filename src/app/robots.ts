import type { MetadataRoute } from "next";

const DISALLOW = ["/dashboard", "/report", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      // Explicitly welcome AI crawlers
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: "https://revreclaim.com/sitemap.xml",
  };
}
