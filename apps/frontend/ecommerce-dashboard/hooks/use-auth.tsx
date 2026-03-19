"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import authService, { LoginRequest } from "@/services/auth-service"
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        // Try to get stored user first
        const storedUser = authService.getStoredUser()

        if (storedUser && authService.isAuthenticated()) {
          setUser(storedUser)

          // Optionally verify with the server
          try {
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)
          } catch (err) {
            // If verification fails, clear auth
            await authService.logout()
            setUser(null)
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for session sync events (logout/login from other tabs)
    // Note: authService handles the actual broadcasting and listening internally via sessionSync
    // We just rely on local storage updates or page reloads if needed, 
    // but a more reactive approach would subscribe to sessionSync events.
    // For now, the sessionSync in lib/session-sync.ts handles redirection on LOGOUT.

  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authService.login(email, password)

      if (data.success && data.data) {
        const user: User = {
          id: data.data.userId,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          email: data.data.email,
          roles: data.data.roles,
          permissions: data.data.permissions,
          customerLevel: data.data.customerLevel
        }
        setUser(user)
        router.push("/dashboard")
      } else {
        // Handle case where login API returns success: false
        setError("Login failed. Please check your credentials.")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials."
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
        confirmPassword
      })

      // Registration successful - redirect to login
      toast({
        title: "Registration successful",
        description: "Please login with your new account.",
      })
      router.push("/login")
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again."
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
    } catch (err) {
      console.error("Logout error:", err)
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
    clearError
  }

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}