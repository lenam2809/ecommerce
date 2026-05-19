import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { sessionSync } from "@/lib/session-sync"
import { logger } from "@/lib/logger"

// Create an axios instance with default config
// Use relative /api so requests go same-origin → proxied by Next.js → cookies set for frontend domain
const api = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CRITICAL: Enable sending cookies with all requests
})

// Token Refresh Queue - prevents race condition when multiple requests fail with 401
let isRefreshing = false
let refreshSubscribers: ((success: boolean) => void)[] = []

// Retry limit — max 3 refresh attempts per minute to prevent infinite loops
let refreshAttemptCount = 0
let refreshAttemptResetTimer: ReturnType<typeof setTimeout> | null = null

function canAttemptRefresh(): boolean {
  if (refreshAttemptCount >= 3) return false
  refreshAttemptCount++
  if (!refreshAttemptResetTimer) {
    refreshAttemptResetTimer = setTimeout(() => {
      refreshAttemptCount = 0
      refreshAttemptResetTimer = null
    }, 60_000) // reset counter after 1 minute
  }
  return true
}

function subscribeToRefresh(callback: (success: boolean) => void) {
  refreshSubscribers.push(callback)
}

function notifyRefreshComplete(success: boolean) {
  refreshSubscribers.forEach(callback => callback(success))
  refreshSubscribers = []
}

async function refreshTokenSilently(): Promise<boolean> {
  try {
    // Cookie is automatically sent with request due to withCredentials
    await axios.post(
      '/api/auth/refresh-token',
      {},
      { withCredentials: true }
    )
    logger.debug('Token refresh successful')

    // Notify other tabs that session was refreshed
    sessionSync.broadcast('SESSION_REFRESH')

    return true
  } catch (error) {
    logger.error('Token refresh failed:', error)
    return false
  }
}

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined

  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))

  return match?.split('=')[1]
}

/**
 * Clear user data and redirect to login with returnUrl
 * Only call this for actual authentication failures (401/403)
 */
function handleAuthFailure(originalRequest: InternalAxiosRequestConfig) {
  if (typeof window === "undefined") return

  const requestUrl = originalRequest.url || ""

  // List of endpoints that should not trigger a redirect for guests
  const softEndpoints = ["wishlist", "me/profile", "products", "cart", "categories", "banner"]
  const isSoftEndpoint = softEndpoints.some(ep => requestUrl.includes(ep))

  if (isSoftEndpoint) {
    logger.debug("Guest 401 suppressed for:", requestUrl)
    return // Don't redirect guests for soft endpoints
  }

  // Save current URL as returnUrl before clearing data
  const currentPath = window.location.pathname + window.location.search
  const returnUrl = encodeURIComponent(currentPath)

  sessionSync.broadcast('LOGOUT', { returnUrl })

  // Redirect to login with returnUrl
  if (window.location.pathname !== '/login') window.location.href = `/login?returnUrl=${returnUrl}`
}

// Request interceptor - Add CSRF token and Guest ID
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token for POST, PUT, DELETE, PATCH requests
    const method = config.method?.toUpperCase()
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }

    // Add Guest ID header for cart operations
    if (typeof window !== "undefined") {
      const guestId = localStorage.getItem("guest_id")
      if (guestId) {
        config.headers["X-Guest-ID"] = guestId
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for 401/403 handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // ONLY handle 401 Unauthorized and 403 Forbidden - let other errors pass through
    if (status !== 401 && status !== 403) {
      return Promise.reject(error)
    }

    // Handle 401/403 with token refresh attempt (only for 401)
    if (status === 401 && !originalRequest._retry) {
      // Enforce retry limit before attempting refresh
      if (!canAttemptRefresh()) {
        logger.warn('Token refresh limit reached (3/min). Treating as auth failure.')
        handleAuthFailure(originalRequest)
        return Promise.reject(error)
      }

      // Check if we're already refreshing
      if (isRefreshing) {
        // Wait for the ongoing refresh
        return new Promise((resolve, reject) => {
          subscribeToRefresh((success) => {
            if (success) {
              resolve(api(originalRequest))
            } else {
              reject(error)
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshSuccess = await refreshTokenSilently()
      isRefreshing = false
      notifyRefreshComplete(refreshSuccess)

      if (refreshSuccess) {
        // Retry the original request - cookie is already updated
        return api(originalRequest)
      }

      // Refresh failed - handle based on guest status
      handleAuthFailure(originalRequest)

      // For guests on soft endpoints, return empty data instead of rejecting
      const requestUrl = originalRequest.url || ""
      const softEndpoints = ["wishlist", "me/profile", "products", "cart", "categories", "banner"]
      const isSoftEndpoint = softEndpoints.some(ep => requestUrl.includes(ep))

      if (isSoftEndpoint) {
        return Promise.resolve({ data: null })
      }

      return Promise.reject(error)
    }

    // Handle other 401/403 errors (already retried or different reason)
    if ((status === 401 && originalRequest._retry) || status === 403) {
      handleAuthFailure(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default api
