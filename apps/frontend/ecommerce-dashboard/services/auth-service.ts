import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import { User } from "@/types/user"
import { logger } from "@/lib/logger"
import { sessionSync } from "@/lib/session-sync"

export interface AuthResponse {
    success: boolean
    data: {
        accessToken?: string      // Optional - only present if IncludeTokensInResponse is true
        refreshToken?: string     // Optional - only present if IncludeTokensInResponse is true
        userId: string
        email: string
        firstName: string
        lastName: string
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
    name: string
    email: string
    phone: string
    password: string
    confirmPassword: string
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
    private clearUser(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem("user")
        }
    }

    /**
     * Login user - cookies are set by backend automatically
     */
    public async login(email: string, password: string): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>("/auth/login", {
            email,
            password
        } as LoginRequest)

        logger.debug("Login response:", data.data)

        if (data.success && data.data) {
            // Check if user has Admin role
            if (!data.data.roles.includes('Admin')) {
                toast({
                    title: "Thất bại",
                    description: "Bạn không có quyền truy cập.",
                })
                return {
                    success: false,
                    data: {
                        userId: "",
                        email: "",
                        firstName: "",
                        lastName: "",
                        roles: [],
                        permissions: [],
                        customerLevel: 0
                    }
                }
            }

            toast({
                title: "Thành công",
                description: "Bạn đã đăng nhập thành công.",
            })

            // Store only user info - tokens are in httpOnly cookies
            const user: User = {
                id: data.data.userId,
                firstName: data.data.firstName,
                lastName: data.data.lastName,
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
    public async register(registerData: RegisterRequest): Promise<{ success: boolean; data?: unknown }> {
        const { data } = await api.post("/auth/register", registerData)
        // Registration doesn't set cookies - user needs to login after registration
        return data
    }

    /**
     * Logout user - cookies are cleared by backend
     */
    public async logout(): Promise<void> {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            logger.error("Error during logout:", error)
        } finally {
            this.clearUser()
            // Notify other tabs about logout
            sessionSync.broadcast('LOGOUT')
        }
    }

    /**
     * Get current authenticated user from server
     */
    public async getCurrentUser(): Promise<User> {
        const { data } = await api.get("/auth/profile")

        if (!data.success || !data.data) {
            throw new Error("Invalid response from server")
        }

        const userData = data.data
        const user: User = {
            id: userData.id,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email,
            roles: userData.roles || [],
            permissions: userData.permissions || [],
            customerLevel: userData.customerLevel || 0,
            phone: userData.phoneNumber || userData.phone || "",
            avatar: userData.avatar || "",
            fullName: userData.fullName || "",
            phoneNumber: userData.phoneNumber || "",
            promotionPoints: userData.promotionPoints || 0,
            status: userData.status || 0,
            createdAt: userData.createdAt || "",
            updatedAt: userData.updatedAt || "",
            lastLogin: userData.lastLogin || null,
        }

        this.storeUser(user)
        return user
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
}

const authService = new AuthService()

export default authService