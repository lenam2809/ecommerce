import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import { User } from "@/types/user"
import { logger } from "@/lib/logger"
import { sessionSync } from "@/lib/session-sync"

export interface AuthResponse {
    success: boolean
    data: {
        accessToken?: string
        refreshToken?: string
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

interface MeProfileResponse {
    userId: string
    email: string
    roles: string[]
    permissions: string[]
}

class AuthService {
    private user: User | null = null

    public isAuthenticated(): boolean {
        return !!this.user
    }

    public async login(email: string, password: string): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
        } as LoginRequest)

        logger.debug("Login response:", data.data)

        if (data.success && data.data) {
            const hasAdminRole = data.data.roles.includes("Admin") || data.data.roles.includes("Manager")
            if (!hasAdminRole) {
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
                        customerLevel: 0,
                    },
                }
            }

            toast({
                title: "Thành công",
                description: "Bạn đã đăng nhập thành công.",
            })

            this.user = {
                id: data.data.userId,
                firstName: data.data.firstName,
                lastName: data.data.lastName,
                email: data.data.email,
                roles: data.data.roles,
                permissions: data.data.permissions,
                customerLevel: data.data.customerLevel,
            }

            sessionSync.broadcast("LOGIN", { user: this.user })
        }

        return data
    }

    public async register(registerData: RegisterRequest): Promise<{ success: boolean; data?: unknown }> {
        const { data } = await api.post("/auth/register", registerData)
        return data
    }

    public async logout(): Promise<void> {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            logger.error("Error during logout:", error)
        } finally {
            this.user = null
            sessionSync.broadcast("LOGOUT")
        }
    }

    public async getCurrentUser(): Promise<User> {
        const { data } = await api.get<MeProfileResponse>("/auth/me/profile")

        this.user = {
            id: data.userId,
            firstName: "",
            lastName: "",
            email: data.email,
            roles: data.roles || [],
            permissions: data.permissions || [],
            customerLevel: 0,
            phone: "",
            avatar: "",
            fullName: "",
            phoneNumber: "",
            promotionPoints: 0,
            status: 0,
            createdAt: "",
            updatedAt: "",
            lastLogin: null,
        }

        return this.user
    }

    public async verifyAuthentication(): Promise<boolean> {
        try {
            await this.getCurrentUser()
            return true
        } catch {
            return false
        }
    }
}

const authService = new AuthService()

export default authService
