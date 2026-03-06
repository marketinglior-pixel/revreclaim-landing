import { describe, it, expect, beforeEach } from "vitest";
import { EXPERIMENTS, getVariant } from "../ab-testing";

describe("ab-testing", () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(";").forEach((c) => {
      const name = c.trim().split("=")[0];
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  });

  describe("EXPERIMENTS config", () => {
    it("has hero_headline experiment defined", () => {
      expect(EXPERIMENTS.hero_headline).toBeDefined();
      expect(EXPERIMENTS.hero_headline.name).toBe("hero_headline");
      expect(EXPERIMENTS.hero_headline.variants).toEqual(["control", "variant_a"]);
    });

    it("has cta_text experiment defined", () => {
      expect(EXPERIMENTS.cta_text).toBeDefined();
      expect(EXPERIMENTS.cta_text.name).toBe("cta_text");
      expect(EXPERIMENTS.cta_text.variants).toEqual(["control", "variant_a"]);
    });
  });

  describe("getVariant()", () => {
    it("returns a valid variant for hero_headline", () => {
      const variant = getVariant("hero_headline");
      expect(["control", "variant_a"]).toContain(variant);
    });

    it("returns a valid variant for cta_text", () => {
      const variant = getVariant("cta_text");
      expect(["control", "variant_a"]).toContain(variant);
    });

    it("returns null for unknown experiment name", () => {
      const variant = getVariant("nonexistent_experiment");
      expect(variant).toBeNull();
    });

    it("returns the same variant on subsequent calls (cookie persistence)", () => {
      const first = getVariant("hero_headline");
      const second = getVariant("hero_headline");
      expect(first).toBe(second);
    });

    it("sets a cookie when assigning a variant", () => {
      getVariant("hero_headline");
      expect(document.cookie).toContain("ab_hero_headline=");
    });
  });
});
