import api from "@/lib/api"
import { Result } from "@/types"
import { sessionSync } from "@/lib/session-sync"

export interface User {
    id: string
    firstName: string
    lastName: string
    fullName: string
    email: string
    roles: string[]
    permissions: string[]
    customerLevel: number
    phoneNumber?: string
    avatar?: string
}

export interface AuthResponse {
    success: boolean
    data: {
        accessToken?: string      // Optional - only present if IncludeTokensInResponse is true
        refreshToken?: string     // Optional - only present if IncludeTokensInResponse is true
        userId: string
        email: string
        firstName: string
        lastName: string
        fullName: string
        phoneNumber: string
        avatar: string
        roles: string[]
        permissions: string[]
        customerLevel: number
    }
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    password: string
    confirmPassword?: string
}

class AuthService {
    /**
     * Store user data in localStorage (NOT tokens - those are in httpOnly cookies)
     */
    private storeUser(user: User): void {
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user))
        }
    }

    /**
     * Get the current user from localStorage
     */
    public getStoredUser(): User | null {
        if (typeof window === "undefined") return null
        const userData = localStorage.getItem("user")
        return userData ? JSON.parse(userData) : null
    }

    /**
     * Clear user data from localStorage
     */
    public clearUser(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem("user")
        }
    }

    /**
     * Get the auth token - now just checks if user is stored
     * Actual token is in httpOnly cookie, not accessible from JS
     */
    public getAuthToken(): string | null {
        // Return a placeholder if user is authenticated
        // The actual token is in httpOnly cookies
        return this.getStoredUser() ? "cookie-based-auth" : null
    }

    /**
     * Login user - cookies are set by backend automatically
     */
    public async login(email: string, password: string): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>("/auth/login", {
            email,
            password
        } as LoginRequest)

        if (data.success && data.data) {
            // Store only user info - tokens are in httpOnly cookies
            const user: User = {
                id: data.data.userId,
                firstName: data.data.firstName,
                lastName: data.data.lastName,
                fullName: data.data.fullName,
                phoneNumber: data.data.phoneNumber,
                email: data.data.email,
                roles: data.data.roles,
                permissions: data.data.permissions,
                customerLevel: data.data.customerLevel
            }
            this.storeUser(user)

            // Notify other tabs about login
            sessionSync.broadcast('LOGIN', { user })
        }

        return data
    }

    /**
     * Register new user
     */
    public async register(registerData: RegisterRequest): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>("/auth/register", registerData)
        // Registration may or may not set cookies depending on backend implementation
        // For this app, registration returns user ID and user needs to login
        return data
    }

    /**
     * Logout user - cookies are cleared by backend
     */
    public async logout(): Promise<void> {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            console.error("Error during logout:", error)
        } finally {
            this.clearUser()
            // Notify other tabs about logout
            sessionSync.broadcast('LOGOUT')
        }
    }

    /**
     * Get current authenticated user from server
     */
    public async getCurrentUser(): Promise<Result<User>> {
        const { data } = await api.get("/auth/profile")

        if (data.success && data.data) {
            const user: User = {
                id: data.data.id,
                firstName: data.data.firstName || "",
                lastName: data.data.lastName || "",
                fullName: data.data.fullName || "",
                phoneNumber: data.data.phoneNumber || "",
                email: data.data.email,
                avatar: data.data.avatar,
                roles: data.data.roles || [],
                permissions: data.data.permissions || [],
                customerLevel: data.data.customerLevel || 0
            }
            this.storeUser(user)
        }

        return data
    }

    /**
     * Check if user is authenticated (based on stored user data)
     * Note: Only backend can truly verify if cookies are valid
     */
    public isAuthenticated(): boolean {
        if (typeof window === "undefined") return false
        return this.getStoredUser() !== null
    }

    /**
     * Verify authentication by calling the profile endpoint
     * This will fail if cookies are invalid/expired
     */
    public async verifyAuthentication(): Promise<boolean> {
        try {
            await this.getCurrentUser()
            return true
        } catch {
            this.clearUser()
            return false
        }
    }

    /**
     * Sync auth state - no longer needed with httpOnly cookies
     * Kept for backward compatibility, does nothing now
     */
    public syncAuthState(): void {
        // No-op - cookies are managed by the browser
    }
}

const authService = new AuthService()

export default authService