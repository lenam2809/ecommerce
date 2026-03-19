import type { Icon } from "lucide-react"

export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: Icon
  label?: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

export type SidebarNavItem = NavItemWithChildren


export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}
