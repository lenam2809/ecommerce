"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import authService, { User } from "@/services/auth-service"
import { useRouter } from "next/navigation"
import { clearGuestId, getGuestId } from "@/lib/guest-id"
import cartService from "@/services/cart-service"
import { logger } from "@/lib/logger"

interface AuthContextType {
    user: User | null
    loading: boolean
    error: string | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (registerData: { firstName: string; lastName: string; email: string; phoneNumber?: string; password: string; confirmPassword?: string }) => Promise<void>
    logout: () => Promise<void>
    clearError: () => void
    /**
     * Re-fetch user từ backend (cookie-based) và cập nhật state đăng nhập.
     * Dùng sau khi backend set cookie (ví dụ luồng OAuth Google) để cập nhật
     * state trong tab hiện tại mà không cần reload trang.
     */
    refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === "string") return error
    if (error && typeof error === "object") {
        const axiosErr = error as {
            response?: {
                data?: {
                    message?: string
                    error?: string
                    errors?: Record<string, string[]> | string[]
                    title?: string
                }
            }
            message?: string
        }
        const data = axiosErr.response?.data
        if (data?.error) return data.error
        if (data?.message) return data.message
        if (data?.title) return data.title
        if (data?.errors) {
            if (Array.isArray(data.errors) && data.errors.length > 0) {
                return data.errors[0]
            }
            if (typeof data.errors === "object") {
                const firstVal = Object.values(data.errors)[0]
                if (Array.isArray(firstVal) && firstVal.length > 0) {
                    return firstVal[0]
                }
                if (typeof firstVal === "string") {
                    return firstVal
                }
            }
        }
        if (axiosErr.message) return axiosErr.message
    }
    return fallback
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true)
            setError(null)

            try {
                const currentUser = await authService.getCurrentUser()
                if (currentUser.success && currentUser.data) {
                    setUser(currentUser.data)
                } else {
                    setUser(null)
                }
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)

        try {
            const data = await authService.login(email, password)

            if (data.success && data.data) {
                const nextUser: User = {
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

                const currentGuestId = getGuestId()
                if (currentGuestId) {
                    try {
                        await cartService.mergeCart(currentGuestId)
                    } catch (mergeErr) {
                        logger.error("Auto merge cart error:", mergeErr)
                    }
                }
                setUser(nextUser)
                clearGuestId()
            } else {
                const failureMessage = data.message || "Email hoặc mật khẩu không chính xác"
                setError(failureMessage)
                throw new Error(failureMessage)
            }
        } catch (err: unknown) {
            const errorMessage = getApiErrorMessage(err, "Email hoặc mật khẩu không chính xác")
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register = async (registerData: {
        firstName: string
        lastName: string
        email: string
        phoneNumber?: string
        password: string
        confirmPassword?: string
    }) => {
        setLoading(true)
        setError(null)

        try {
            const data = await authService.register(registerData)
            if (!data.success) {
                const failureMessage = data.message || "Đăng ký thất bại. Vui lòng thử lại sau."
                setError(failureMessage)
                throw new Error(failureMessage)
            }
            router.push("/login")
        } catch (err: unknown) {
            const errorMessage = getApiErrorMessage(err, "Đăng ký thất bại. Vui lòng thử lại sau.")
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setLoading(true)

        try {
            await authService.logout()
            setUser(null)
            router.push("/login")
        } catch {
            setUser(null)
            router.push("/login")
        } finally {
            setLoading(false)
        }
    }

    const clearError = () => {
        setError(null)
    }

    // useCallback: giữ reference ổn định để các effect phụ thuộc vào refreshUser
    // (vd trang /auth/google-callback) không chạy lại vô hạn khi AuthProvider re-render.
    const refreshUser = useCallback(async (): Promise<User | null> => {
        setError(null)

        try {
            const currentUser = await authService.getCurrentUser()
            if (currentUser.success && currentUser.data) {
                setUser(currentUser.data)
                return currentUser.data
            }
            setUser(null)
            return null
        } catch {
            setUser(null)
            return null
        }
    }, [])

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        clearError,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    return context
}
