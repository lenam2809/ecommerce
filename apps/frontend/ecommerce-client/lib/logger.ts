/**
 * Production-safe logger utility.
 * In production builds, all log/debug/info calls are no-ops.
 * Only error and warn are kept in production for critical visibility.
 */

const isDev = process.env.NODE_ENV !== "production"

export const logger = {
  /** Debug info — silenced in production */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug("[DEBUG]", ...args)
  },

  /** General info — silenced in production */
  log: (...args: unknown[]) => {
    if (isDev) console.log("[INFO]", ...args)
  },

  /** Warnings — kept in production */
  warn: (...args: unknown[]) => {
    console.warn("[WARN]", ...args)
  },

  /** Errors — always shown */
  error: (...args: unknown[]) => {
    console.error("[ERROR]", ...args)
  },
}
