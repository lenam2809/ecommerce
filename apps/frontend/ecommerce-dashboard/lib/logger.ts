/**
 * Centralized logging service
 * Replaces console.log statements with structured logging
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Debug logs - only shown in development
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logs - shown in all environments
   */
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },

  /**
   * Warning logs
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - shown in all environments
   * TODO: Integrate with error tracking service (e.g., Sentry) in production
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    
    // Future: Send to error tracking service
    // if (!isDev && typeof window !== 'undefined') {
    //   Sentry.captureException(args[0]);
    // }
  },
};
