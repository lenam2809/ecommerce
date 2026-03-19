import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

type AuthGuardProps = {
    children: React.ReactNode
    requireAuth?: boolean
    redirectAuthenticatedTo?: string
}

const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requireAuth = true,
    redirectAuthenticatedTo
}) => {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            // Case 1: Route requires authentication and user is not logged in
            if (requireAuth && !user) {
                const returnUrl = window.location.pathname;
                router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
            }

            // Case 2: User is logged in but should be redirected (e.g., login page when already authenticated)
            else if (!requireAuth && user && redirectAuthenticatedTo) {
                router.push(redirectAuthenticatedTo)
            }
        }
    }, [user, loading, requireAuth, redirectAuthenticatedTo, router])

    // Show loading or nothing during authentication check
    if (loading || (requireAuth && !user) || (!requireAuth && user && redirectAuthenticatedTo)) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    // Authentication passed, render children
    return <>{children}</>
}

export default AuthGuard