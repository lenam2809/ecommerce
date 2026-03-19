import { LayoutDashboard, ShoppingCart, Package, Users, Settings, BarChart } from "lucide-react"

import type { SidebarNavItem } from "@/types"

interface DashboardConfig {
  mainNav: SidebarNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      items: []
    },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: Package,
      items: [
        {
          title: "Add Products",
          href: "/dashboard/products/new",
          icon: Package,
          items: []
        },
      ]
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      items: []
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      items: []
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      items: [],
    },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: Package,
      items: [],
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      items: [],
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      items: [],
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart,
      items: [],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      items: [],
    },
  ],
}
