"use client"

import Link from "next/link"
import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { EPermission, EPermissions, hasPermission } from "@/types/permission"

export type NavMainItem = {
  title: string
  url: string
  icon?: Icon
  items?: {
    title: string
    url: string
    icon?: Icon
    permissions?: EPermission[] | string
  }[]
  permissions?: EPermission[] | string
  isActive?: boolean
}

export interface NavMainProps {
  items: NavMainItem[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Check if the current path matches the item URL or is a child of it
  const isActive = (itemUrl: string) => {
    if (pathname === itemUrl) return true
    if (itemUrl !== "/" && pathname.startsWith(itemUrl + "/")) return true
    return false
  }

  // Check if any subitem is active
  const hasActiveChild = (item: NavMainItem) => {
    return item.items?.some((subItem) => isActive(subItem.url)) || false
  }

  // Filter items based on permissions
  const filteredItems = items.filter(item => {
    // Check parent item permission
    if (!hasPermission(user?.permissions, item.permissions)) return false

    // Filter subitems if exists
    if (item.items) {
      item.items = item.items.filter(subItem =>
        hasPermission(user?.permissions, subItem.permissions))
      return item.items.length > 0
    }

    return true
  })

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chức năng chính</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {hasPermission(user?.permissions, EPermissions.CreateProduct) && (
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlusFilled />
                <Link href="/products/new">
                  <span>Thêm mới nhanh</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        <SidebarMenu>
          {filteredItems.map((item) =>
            !item.items ? (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                >
                  <Link
                    href={item.url}
                    className="focus-visible:outline-none focus:shadow-md"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={hasActiveChild(item)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={hasActiveChild(item)}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive(subItem.url)}
                          >
                            <Link href={subItem.url}>
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}