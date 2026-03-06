import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before importing the module
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

// Mock the types module
vi.mock("@/lib/supabase/types", () => ({
  Database: {},
  Json: {},
}));

import { trackEvent } from "../analytics";
import type { AnalyticsEvent } from "../analytics";

describe("analytics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("trackEvent is a callable function", () => {
    expect(typeof trackEvent).toBe("function");
  });

  it("trackEvent does not throw when called with valid event", async () => {
    await expect(
      trackEvent("cta_clicked", null, { location: "hero" })
    ).resolves.not.toThrow();
  });

  it("trackEvent does not throw when called without data", async () => {
    await expect(trackEvent("page_view", null)).resolves.not.toThrow();
  });

  it("trackEvent does not throw when called with userId", async () => {
    await expect(
      trackEvent("scan_started", "user-123", { source: "dashboard" })
    ).resolves.not.toThrow();
  });

  it("AnalyticsEvent type includes expected event names", () => {
    // Type-level check: these assignments would fail at compile time if the type is wrong
    const events: AnalyticsEvent[] = [
      "scan_started",
      "scan_completed",
      "plan_upgraded",
      "plan_cancelled",
      "plan_reactivated",
      "auto_scan_enabled",
      "team_member_invited",
      "checkout_started",
      "billing_portal_opened",
      "page_view",
      "section_viewed",
      "cta_clicked",
      "newsletter_signup",
    ];
    expect(events).toHaveLength(13);
  });
});
