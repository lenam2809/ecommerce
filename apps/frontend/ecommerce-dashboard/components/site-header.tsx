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
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <div key={item.href} className="flex items-center gap-2">
                  <BreadcrumbItem key={item.href} className={index === 0 ? "hidden md:block" : ""}>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>

                  {!isLast && <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />}
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
