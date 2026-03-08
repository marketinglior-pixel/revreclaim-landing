import { LeakType } from "./types";

/**
 * Leak types that require manual review (no automated recovery action).
 * These are separated from "Needs Action" leaks in the report UI.
 */
export const REVIEW_ONLY_LEAK_TYPES: Set<LeakType> = new Set([
  "legacy_pricing",
  "never_expiring_discount",
]);

/** Returns true if the leak type has automated recovery actions. */
export function isActionableLeak(type: LeakType): boolean {
  return !REVIEW_ONLY_LEAK_TYPES.has(type);
}
