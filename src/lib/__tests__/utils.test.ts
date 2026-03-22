import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCurrencyDetailed,
  maskEmail,
  validateApiKey,
  validateEmail,
  getSeverityColor,
  getSeverityLabel,
} from "../utils";

describe("formatCurrency", () => {
  it("formats positive cents as dollars", () => {
    expect(formatCurrency(29900)).toBe("$299");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats large amounts", () => {
    expect(formatCurrency(1500000)).toBe("$15,000");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-5000)).toBe("-$50");
  });
});

describe("formatCurrencyDetailed", () => {
  it("formats with cents precision", () => {
    expect(formatCurrencyDetailed(29999)).toBe("$299.99");
  });

  it("formats whole dollar amounts with .00", () => {
    expect(formatCurrencyDetailed(10000)).toBe("$100.00");
  });
});

describe("maskEmail", () => {
  it("masks email correctly", () => {
    expect(maskEmail("john@example.com")).toBe("j***@example.com");
  });

  it("handles single-char local part", () => {
    expect(maskEmail("a@b.com")).toBe("*@b.com");
  });

  it("handles null", () => {
    expect(maskEmail(null)).toBe("Unknown");
  });

  it("handles email without @", () => {
    expect(maskEmail("noemail")).toBe("***");
  });
});

describe("validateApiKey", () => {
  it("accepts valid live key", () => {
    expect(validateApiKey("rk_live_abc123xyz456def789")).toEqual({
      valid: true,
    });
  });

  it("accepts valid test key", () => {
    expect(validateApiKey("rk_test_abc123xyz456def789")).toEqual({
      valid: true,
    });
  });

  it("rejects empty string", () => {
    const result = validateApiKey("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("required");
  });

  it("rejects short key", () => {
    const result = validateApiKey("rk_l_ab");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too short");
  });

  it("rejects key with wrong prefix", () => {
    const result = validateApiKey("sk_live_abc123xyz456def789");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("restricted API key");
  });
});

describe("validateEmail", () => {
  it("accepts valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(validateEmail("not-an-email")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });
});

describe("getSeverityColor", () => {
  it("returns red for critical", () => {
    expect(getSeverityColor("critical")).toBe("#EF4444");
  });

  it("returns red for high", () => {
    expect(getSeverityColor("high")).toBe("#EF4444");
  });

  it("returns light red for medium", () => {
    expect(getSeverityColor("medium")).toBe("#EF444480");
  });

  it("returns light red for low", () => {
    expect(getSeverityColor("low")).toBe("#EF444480");
  });
});

describe("getSeverityLabel", () => {
  it("capitalizes severity", () => {
    expect(getSeverityLabel("critical")).toBe("Critical");
    expect(getSeverityLabel("high")).toBe("High");
    expect(getSeverityLabel("medium")).toBe("Medium");
    expect(getSeverityLabel("low")).toBe("Low");
  });
});
