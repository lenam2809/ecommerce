"use client"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ui/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb"
import { useBreadcrumbs } from "@/lib/breadcrumb-utils"

export function SiteHeader() {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center justify-between gap-2 border-b border-[--color-border] bg-[--color-bg-base] px-4 transition-[width,height] ease-linear lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-[--color-text-2] hover:text-[--color-text-1]" />
        <Separator orientation="vertical" className="mx-2 h-4 bg-[--color-border]" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <div key={item.href} className="flex items-center gap-2">
                  <BreadcrumbItem key={item.href} className={index === 0 ? "hidden md:block" : ""}>
                    {isLast ? (
                      <BreadcrumbPage className="text-[--color-text-1] font-medium">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href} className="text-[--color-text-2] hover:text-[--color-text-1] transition-colors">{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>

                  {!isLast && <BreadcrumbSeparator className={index === 0 ? "hidden md:block text-[--color-text-3]" : "text-[--color-text-3]"} />}
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-[--color-text-3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="h-9 w-64 rounded-md border border-[--color-border] bg-[--color-bg-elevated] pl-9 pr-12 text-sm text-[--color-text-1] placeholder-[--color-text-3] transition-all focus:border-[--color-accent] focus:outline-none focus:ring-1 focus:ring-[--color-accent]"
            placeholder="Search..."
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
            <kbd className="inline-flex h-5 items-center rounded border border-[--color-border] bg-[--color-bg-card] px-1.5 font-mono text-[10px] font-medium text-[--color-text-2]">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
        
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-[--color-text-2] transition-colors hover:bg-[--color-bg-elevated] hover:text-[--color-text-1]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[--color-danger] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[--color-danger]"></span>
          </span>
        </button>

        <ModeToggle />
      </div>
    </header>
  )
}
