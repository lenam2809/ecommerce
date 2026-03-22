import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { sessionSync } from "@/lib/session-sync"

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
    console.debug('Token refresh successful')

    // Notify other tabs that session was refreshed
    sessionSync.broadcast('SESSION_REFRESH')

    return true
  } catch (error) {
    console.error('Token refresh failed:', error)
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
 * Clear user data - don't redirect for guest users on soft endpoints
 */
function handleAuthFailure(originalRequest: InternalAxiosRequestConfig) {
  if (typeof window === "undefined") return

  const guestId = localStorage.getItem("guest_id")
  const requestUrl = originalRequest.url || ""

  // List of endpoints that should not trigger a redirect for guests
  const softEndpoints = ["wishlist", "user/profile", "products", "cart"]
  const isSoftEndpoint = softEndpoints.some(ep => requestUrl.includes(ep))

  if (guestId && isSoftEndpoint) {
    console.log("Guest 401 suppressed for:", requestUrl)
    return // Don't redirect guests for soft endpoints
  }

  localStorage.removeItem("user")
  sessionSync.broadcast('LOGOUT')
  window.location.href = "/login"
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

// Response interceptor for 401 handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized with token refresh attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
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
      const guestId = typeof window !== "undefined" ? localStorage.getItem("guest_id") : null
      const requestUrl = originalRequest.url || ""
      const softEndpoints = ["wishlist", "user/profile", "products", "cart"]
      const isSoftEndpoint = softEndpoints.some(ep => requestUrl.includes(ep))

      if (guestId && isSoftEndpoint) {
        return Promise.resolve({ data: null })
      }

      return Promise.reject(error)
    }

    // Handle other 401 errors (already retried or different reason)
    if (error.response?.status === 401 && originalRequest._retry) {
      handleAuthFailure(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default api