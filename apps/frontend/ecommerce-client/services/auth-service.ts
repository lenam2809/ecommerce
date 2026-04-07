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
        accessToken?: string
        refreshToken?: string
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

interface MeProfileResponse {
    userId: string
    email: string
    roles: string[]
    permissions: string[]
}

class AuthService {
    /**
     * Login user - cookies are set by backend automatically.
     */
    public async login(email: string, password: string): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
        } as LoginRequest)

        if (data.success && data.data) {
            const user: User = {
                id: data.data.userId,
                firstName: data.data.firstName,
                lastName: data.data.lastName,
                fullName: data.data.fullName,
                phoneNumber: data.data.phoneNumber,
                email: data.data.email,
                roles: data.data.roles,
                permissions: data.data.permissions,
                customerLevel: data.data.customerLevel,
                avatar: data.data.avatar,
            }

            sessionSync.broadcast("LOGIN", { user })
        }

        return data
    }

    /**
     * Register new user.
     */
    public async register(registerData: RegisterRequest): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>("/auth/register", registerData)
        return data
    }

    /**
     * Logout user - cookies are cleared by backend.
     */
    public async logout(): Promise<void> {
        try {
            await api.post("/auth/logout")
        } finally {
            sessionSync.broadcast("LOGOUT")
        }
    }

    /**
     * Get current authenticated user from server (cookie-based session rehydration).
     */
    public async getCurrentUser(): Promise<Result<User>> {
        const { data } = await api.get<MeProfileResponse>("/auth/me/profile")

        return {
            success: true,
            data: {
                id: data.userId,
                firstName: "",
                lastName: "",
                fullName: "",
                email: data.email,
                avatar: "",
                phoneNumber: "",
                roles: data.roles || [],
                permissions: data.permissions || [],
                customerLevel: 0,
            },
        }
    }

    /**
     * Verify authentication by calling profile endpoint.
     */
    public async verifyAuthentication(): Promise<boolean> {
        try {
            await this.getCurrentUser()
            return true
        } catch {
            return false
        }
    }

    /**
     * Request password reset email.
     */
    public async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
        const response = await api.post("/auth/forgot-password", { email })
        return response.data
    }

    /**
     * Verify reset-password request id and set short-lived reset context cookie.
     */
    public async verifyResetPasswordRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
        const response = await api.post("/auth/reset-password/verify", { requestId })
        return response.data
    }

    /**
     * Confirm reset-password using reset context cookie only.
     */
    public async confirmResetPassword(newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
        const response = await api.post("/auth/reset-password/confirm", { newPassword })
        return response.data
    }

    /**
     * Legacy reset endpoint kept for backward compatibility.
     */
    public async resetPassword(data: unknown): Promise<{ success: boolean; message?: string }> {
        const response = await api.post("/auth/reset-password", data)
        return response.data
    }
}

const authService = new AuthService()

export default authService
