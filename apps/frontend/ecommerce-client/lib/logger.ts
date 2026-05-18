/**
 * Production-safe logger utility.
 * In production builds, all log/debug/info calls are no-ops.
 * Only error and warn are kept in production for critical visibility.
 */

const isDev = process.env.NODE_ENV !== "production"
const sensitiveKeyPattern = /(token|cookie|authorization|password|secret|email|phone|address|payment|vnpay|txn|transaction)/i

function sanitizeLogArg(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    }
  }

  if (!value || typeof value !== "object") {
    return value
  }

  if (seen.has(value)) {
    return "[Circular]"
  }

  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogArg(item, seen))
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[REDACTED]" : sanitizeLogArg(entry, seen),
    ])
  )
}

function sanitizeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => sanitizeLogArg(arg))
}

export const logger = {
  /** Debug info — silenced in production */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug("[DEBUG]", ...sanitizeArgs(args))
  },

  /** General info — silenced in production */
  log: (...args: unknown[]) => {
    if (isDev) console.info("[INFO]", ...sanitizeArgs(args))
  },

  /** Warnings — kept in production */
  warn: (...args: unknown[]) => {
    console.warn("[WARN]", ...sanitizeArgs(args))
  },

  /** Errors — always shown */
  error: (...args: unknown[]) => {
    console.error("[ERROR]", ...sanitizeArgs(args))
  },
}
