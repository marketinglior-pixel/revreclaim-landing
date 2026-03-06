import { Leak, LeakSeverity } from "./types";

export function formatCurrency(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
  return cents < 0 ? `-${formatted}` : formatted;
}

export function formatCurrencyDetailed(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
  return cents < 0 ? `-${formatted}` : formatted;
}

export function generateReportId(): string {
  return crypto.randomUUID();
}

export function maskEmail(email: string | null): string {
  if (!email) return "Unknown";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal =
    local.length <= 1 ? "*" : local[0] + "***";
  return `${maskedLocal}@${domain}`;
}

export function calculateHealthScore(
  leaks: Leak[],
  totalMRR: number
): number {
  if (totalMRR === 0) return 100;

  const mrrAtRisk = leaks.reduce((sum, l) => sum + l.monthlyImpact, 0);
  const leakPercentage = mrrAtRisk / totalMRR;

  let score = 100;

  // Up to 40 points deducted for MRR impact percentage
  score -= Math.min(40, leakPercentage * 100 * 8);

  // Up to 30 points for critical leaks
  score -= Math.min(
    30,
    leaks.filter((l) => l.severity === "critical").length * 5
  );

  // Up to 20 points for high severity leaks
  score -= Math.min(
    20,
    leaks.filter((l) => l.severity === "high").length * 3
  );

  // Up to 10 points for total leak count
  score -= Math.min(10, leaks.length * 0.5);

  return Math.max(0, Math.round(score));
}

export function validateApiKey(
  key: string,
  platform: string = "stripe"
): {
  valid: boolean;
  error?: string;
} {
  if (!key) return { valid: false, error: "API key is required" };
  if (key.length < 10) return { valid: false, error: "API key is too short" };

  switch (platform) {
    case "stripe":
      if (!/^rk_(live|test)_[A-Za-z0-9]+$/.test(key)) {
        return {
          valid: false,
          error:
            "Must be a Stripe restricted API key (starts with rk_live_ or rk_test_)",
        };
      }
      break;
    case "polar":
      if (!key.startsWith("polar_oat_")) {
        return {
          valid: false,
          error:
            "Must be a Polar Organization Access Token (starts with polar_oat_)",
        };
      }
      break;
    case "lemonsqueezy":
      if (key.length < 30) {
        return {
          valid: false,
          error: "Lemon Squeezy API key appears too short",
        };
      }
      break;
    case "paddle":
      if (key.length < 20) {
        return {
          valid: false,
          error: "Paddle API key appears too short",
        };
      }
      break;
  }
  return { valid: true };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getSeverityColor(severity: LeakSeverity): string {
  switch (severity) {
    case "critical":
      return "#EF4444";
    case "high":
      return "#F59E0B";
    case "medium":
      return "#3B82F6";
    case "low":
      return "#6B7280";
  }
}

export function getSeverityLabel(severity: LeakSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function generateLeakId(): string {
  return crypto.randomUUID().slice(0, 8);
}
