import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { logger } from "@/lib/logger"
import { sessionSync } from "@/lib/session-sync"

// Create an axios instance with default config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
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
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
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
 * Clear user data and redirect to login
 */
function clearAuthAndRedirect() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("user")
        sessionSync.broadcast('LOGOUT')
        window.location.href = "/login"
    }
}

// Request interceptor - Add CSRF token for state-changing requests
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

            // Refresh failed - clear auth and redirect to login
            clearAuthAndRedirect()
            return Promise.reject(error)
        }

        // Handle other 401 errors (already retried or different reason)
        if (error.response?.status === 401 && originalRequest._retry) {
            clearAuthAndRedirect()
        }

        return Promise.reject(error)
    }
)

export default api