/**
 * Lightweight A/B testing infrastructure.
 * Reads/writes cookies to persist variant assignment across sessions.
 */

export interface Experiment {
  name: string;
  variants: string[];
}

export const EXPERIMENTS: Record<string, Experiment> = {
  hero_headline: {
    name: "hero_headline",
    variants: ["control", "variant_a"],
  },
  cta_text: {
    name: "cta_text",
    variants: ["control", "variant_a"],
  },
};

/**
 * Get the assigned variant for an experiment.
 * Reads from cookie if already assigned, otherwise randomly assigns one (50/50).
 * Must be called client-side only.
 */
export function getVariant(experimentName: string): string | null {
  const experiment = EXPERIMENTS[experimentName];
  if (!experiment) return null;

  const cookieName = `ab_${experimentName}`;

  // Check if already assigned
  const existing = getCookie(cookieName);
  if (existing && experiment.variants.includes(existing)) {
    return existing;
  }

  // Assign random variant (50/50 split)
  const variant =
    experiment.variants[Math.floor(Math.random() * experiment.variants.length)];

  // Set cookie for 30 days
  setCookie(cookieName, variant, 30);

  return variant;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
