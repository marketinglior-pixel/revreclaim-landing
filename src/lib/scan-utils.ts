/**
 * Shared utility for calculating next scan time.
 * Used by both scan-config route and weekly-scan cron job.
 */
export function calculateNextScan(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      now.setHours(6, 0, 0, 0); // 6 AM UTC
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      now.setHours(6, 0, 0, 0);
      break;
    case "monthly": {
      // Avoid date overflow: Jan 31 + 1 month → Feb 28, not Mar 3
      const currentDay = now.getDate();
      now.setDate(1); // Reset to 1st to avoid overflow
      now.setMonth(now.getMonth() + 1);
      const lastDay = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      now.setDate(Math.min(currentDay, lastDay));
      now.setHours(6, 0, 0, 0);
      break;
    }
    default:
      now.setDate(now.getDate() + 7);
      now.setHours(6, 0, 0, 0);
  }
  return now.toISOString();
}
