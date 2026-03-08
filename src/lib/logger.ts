// ============================================================
// Structured Logger
// Thin wrapper over console that adds consistent formatting.
// Can be silenced in tests via LOG_LEVEL=silent.
// ============================================================

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

function getLogLevel(): LogLevel {
  const env = (typeof process !== "undefined" && process.env?.LOG_LEVEL) || "info";
  return (env as LogLevel) in LOG_LEVELS ? (env as LogLevel) : "info";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getLogLevel()];
}

function formatArgs(module: string, level: LogLevel, args: unknown[]): unknown[] {
  const prefix = `[${module}]`;
  const timestamp = new Date().toISOString();
  return [`${timestamp} ${prefix} ${level.toUpperCase()}:`, ...args];
}

/**
 * Create a logger instance scoped to a module.
 *
 * Usage:
 *   const log = createLogger("SCAN");
 *   log.info("Starting scan for", userId);
 *   log.error("Scan failed:", error);
 */
export function createLogger(module: string) {
  return {
    debug(...args: unknown[]) {
      if (shouldLog("debug")) console.debug(...formatArgs(module, "debug", args));
    },
    info(...args: unknown[]) {
      if (shouldLog("info")) console.log(...formatArgs(module, "info", args));
    },
    warn(...args: unknown[]) {
      if (shouldLog("warn")) console.warn(...formatArgs(module, "warn", args));
    },
    error(...args: unknown[]) {
      if (shouldLog("error")) console.error(...formatArgs(module, "error", args));
    },
  };
}
