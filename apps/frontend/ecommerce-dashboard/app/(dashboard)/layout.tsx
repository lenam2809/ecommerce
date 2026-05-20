import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    redirect('/login?returnUrl=/dashboard')
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
