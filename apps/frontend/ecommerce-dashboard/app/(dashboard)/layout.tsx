import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

/**
 * Decode the JWT payload without signature verification.
 * Verification is authoritative at the API layer; this is a UX guard only.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Base64url → Base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

function extractRoles(payload: Record<string, unknown>): string[] {
  // .NET encodes ClaimTypes.Role as the full URI or the short "role" key
  const raw =
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload['role']
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') return [raw]
  return []
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = decodeJwtPayload(token)
  if (!payload || !extractRoles(payload).includes('Admin')) {
    redirect('/login')
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "220px",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-x-hidden">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-x-hidden">
            <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-8 xl:px-12 max-w-full overflow-x-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
