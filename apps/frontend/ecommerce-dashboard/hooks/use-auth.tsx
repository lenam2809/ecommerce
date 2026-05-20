"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import authService from "@/services/auth-service"
import { useRouter } from "next/navigation"
import { User } from "@/types/user"
import { toast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, phone: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const maybeError = error as { response?: { data?: { message?: string } } }
  return maybeError.response?.data?.message || fallback
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
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
          email: data.data.email,
          roles: data.data.roles,
          permissions: data.data.permissions,
          customerLevel: data.data.customerLevel,
        }

        setUser(nextUser)
      } else {
        setError("Login failed. Please check your credentials.")
      }
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err, "Login failed. Please check your credentials.")
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      await authService.register({
        name,
        email,
        phone,
        password,
        confirmPassword,
      })

      toast({
        title: "Registration successful",
        description: "Please login with your new account.",
      })
      router.push("/login")
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err, "Registration failed. Please try again.")
      setError(errorMessage)
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

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
