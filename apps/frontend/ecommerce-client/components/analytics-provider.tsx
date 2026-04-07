"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { analytics } from "@/lib/analytics"

/**
 * Analytics Provider Component
 * Automatically tracks page views and initializes analytics
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize analytics on mount
    analytics.init()
  }, [])

  useEffect(() => {
    // Track page views when route changes
    const url = `${pathname}${searchParams ? `?${searchParams}` : ""}`
    
    analytics.trackPageView({
      path: pathname,
      title: document.title || pathname,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    })

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Page view tracked:", url)
    }
  }, [pathname, searchParams])

  return children
}
