"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Bật transition tạm thời khi đổi theme (tránh flicker toàn trang)
  const applyTheme = (next: string) => {
    const html = document.documentElement
    html.classList.add("theme-transition")
    setTheme(next)
    window.setTimeout(() => html.classList.remove("theme-transition"), 400)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-0">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Chuyển chế độ hiển thị (hiện tại: ${theme === "dark" ? "tối" : theme === "light" ? "sáng" : "hệ thống"})`}
          className="rounded-full text-ink-soft hover:text-ink hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {theme === "dark" ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Sun className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-line rounded-xl shadow-lg">
        <DropdownMenuItem
          onClick={() => applyTheme("light")}
          aria-current={theme === "light" ? "true" : "false"}
          className={theme === "light" ? "text-brand font-medium" : ""}
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Sáng</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => applyTheme("dark")}
          aria-current={theme === "dark" ? "true" : "false"}
          className={theme === "dark" ? "text-brand font-medium" : ""}
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Tối</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => applyTheme("system")}
          aria-current={theme === "system" ? "true" : "false"}
          className={theme === "system" ? "text-brand font-medium" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Hệ thống</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
