/**
 * Centralized logging service
 * Replaces direct console statements with structured logging.
 */

const isDev = process.env.NODE_ENV === 'development';
const sensitiveKeyPattern = /(token|cookie|authorization|password|secret|email|phone|address|payment|vnpay|txn|transaction)/i;

function sanitizeLogArg(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogArg(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      sensitiveKeyPattern.test(key) ? '[REDACTED]' : sanitizeLogArg(entry, seen),
    ])
  );
}

function sanitizeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => sanitizeLogArg(arg));
}

export const logger = {
  /**
   * Debug logs - only shown in development
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug('[DEBUG]', ...sanitizeArgs(args));
    }
  },

  /**
   * Info logs - only shown in development
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info('[INFO]', ...sanitizeArgs(args));
    }
  },

  /**
   * Warning logs
   */
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...sanitizeArgs(args));
  },

  /**
   * Error logs - shown in all environments
   * TODO: Integrate with error tracking service (e.g., Sentry) in production
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...sanitizeArgs(args));
    
    // Future: Send to error tracking service
    // if (!isDev && typeof window !== 'undefined') {
    //   Sentry.captureException(args[0]);
    // }
  },
};
