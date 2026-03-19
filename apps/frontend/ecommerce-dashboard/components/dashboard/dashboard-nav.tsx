"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import type { SidebarNavItem } from "@/types"

interface DashboardNavProps {
  items: SidebarNavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()

  if (!items?.length) {
    return null
  }

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          item.href && (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                "justify-start",
                item.disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              <span>{item.title}</span>
            </Link>
          )
        )
      })}
    </nav>
  )
}
