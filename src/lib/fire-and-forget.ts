/**
 * Execute a promise without awaiting it, but log errors instead of swallowing them.
 *
 * Replaces the pattern: `someAsyncFn().catch(() => {})` which silently swallows errors.
 *
 * Usage:
 * ```ts
 * fireAndForget(sendEmail(to, subject), "SCAN_EMAIL");
 * ```
 *
 * @param promise  The async operation to run
 * @param context  Short label for log output (e.g., "SCAN_EMAIL", "ANALYTICS")
 */
export function fireAndForget(
  promise: Promise<unknown>,
  context: string
): void {
  promise.catch((err) => {
    console.error(
      `[${context}]`,
      err instanceof Error ? err.message : String(err)
    );
  });
}
