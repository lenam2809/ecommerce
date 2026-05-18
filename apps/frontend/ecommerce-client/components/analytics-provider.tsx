"use client"

import { logger } from '@/lib/logger'
import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { analytics } from "@/lib/analytics"

function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
      logger.debug("[Analytics] Page view tracked:", url)
    }
  }, [pathname, searchParams])

  return null
}

/**
 * Analytics Provider Component
 * Automatically tracks page views and initializes analytics
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics on mount
    analytics.init()
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  )
}
