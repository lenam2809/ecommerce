"use client"

import * as React from "react"
import {
  IconAddressBook,
  IconBarcode,
  IconBellRinging,
  IconBrandShopee,
  IconCategory,
  IconClockCog,
  IconDashboard,
  IconDevicesCog,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessageCircle,
  IconReport,
  IconReportMoney,
  IconRotate,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconShoppingCartCopy,
  IconSlideshow,
  IconUserBolt,
  IconUserCancel,
  IconUserCheck,
  IconUserQuestion,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { PermissionGroups } from "@/types/permission"

const data = {
  navOverview: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Báo cáo",
      url: "/reports",
      icon: IconReport,
      items: [
        {
          title: "Báo cáo doanh thu",
          url: "/reports/revenue",
          icon: IconReportMoney,
        },
        {
          title: "Báo cáo đơn hàng",
          url: "/reports/orders",
          icon: IconShoppingCartCopy,
        },
        {
          title: "Báo cáo sản phẩm",
          url: "/reports/products",
          icon: IconListDetails,
        },
        {
          title: "Báo cáo người dùng",
          url: "/reports/users",
          icon: IconUsers,
        },
      ],
    },
  ],
  navCatalog: [
    {
      title: "Danh mục",
      url: "/",
      icon: IconCategory,
      permissions: [...PermissionGroups.ProductManagement],
      items: [
        {
          title: "Loại sản phẩm",
          url: "/categories",
          icon: IconCategory,
          permissions: [...PermissionGroups.CategoryManagement]
        },
        {
          title: "Thương hiệu",
          url: "/brands",
          icon: IconListDetails,
          permissions: [...PermissionGroups.BrandManagement]
        },
      ],
    },
    {
      title: "Sản phẩm",
      url: "/products",
      icon: IconListDetails,
      permissions: [...PermissionGroups.ProductManagement]
    },
    {
      title: "Kho hàng (IMEI)",
      url: "/inventory",
      icon: IconBarcode,
    },
  ],
  navSales: [
    {
      title: "Đơn hàng",
      url: "/orders",
      icon: IconShoppingCart,
      permissions: [...PermissionGroups.OrderManagement]
    },
    {
      title: "Đổi/Trả hàng",
      url: "/returns",
      icon: IconRotate,
    },
  ],
  navSystem: [
    {
      title: "Quản lý người dùng",
      url: "/",
      icon: IconUsers,
      permissions: [...PermissionGroups.UserManagement],
      items: [
        {
          title: "Danh sách người dùng",
          url: "/users",
          icon: IconUsers,
        },
        {
          title: "Danh sách tài khoản bị khóa",
          url: "/account-locks",
          icon: IconUserCancel,
        },
        {
          title: "Quản lý hoạt động người dùng",
          url: "/user-activities",
          icon: IconUserBolt,
        },
      ],
    },
    {
      title: "Phân quyền",
      url: "/",
      icon: IconUserQuestion,
      permissions: [...PermissionGroups.PermissionManagement],
      items: [
        {
          title: "Quyền",
          url: "/permissions",
          icon: IconUserQuestion,
          permissions: [...PermissionGroups.PermissionManagement]
        },
        {
          title: "Vai trò",
          url: "/roles",
          icon: IconUserCheck,
          permissions: [...PermissionGroups.RoleManagement]
        },
      ]
    },
    {
      title: "Cấu hình",
      url: "/configs",
      icon: IconDevicesCog,
      items: [
        {
          title: "Banner",
          url: "/configs/banners",
          icon: IconSlideshow,
        },
        {
          title: "Marquee",
          url: "/configs/marquee",
          icon: IconMessageCircle,
        },
        {
          title: "Logo",
          url: "/configs/logo",
          icon: IconUsers,
        },
        {
          title: "Khuyến mãi",
          url: "/configs/promo-codes",
          icon: IconBrandShopee,
        },
      ],
    },
    {
      title: "Hệ thống",
      url: "/",
      icon: IconDevicesCog,
      items: [
        {
          title: "Import sản phẩm",
          url: "/bulk-management/products",
          icon: IconUsers,
        },
        {
          title: "Hoạt động hệ thống",
          url: "/logs",
          icon: IconClockCog,
        },
        {
          title: "Quản lý thông báo",
          url: "/notifications",
          icon: IconBellRinging,
        },
        {
          title: "Quản lý thông tin giới thiệu",
          url: "/about",
          icon: IconSlideshow,
        },
        {
          title: "Quản lý thông tin liên hệ",
          url: "/contact",
          icon: IconAddressBook,
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Cài đặt",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Trợ giúp",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Tìm kiếm",
      url: "#",
      icon: IconSearch,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" passHref>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ShopViet</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="scrollbar-none">
        <NavMain label="Overview" items={data.navOverview} showCreateProduct={true} />
        <NavMain label="Catalog" items={data.navCatalog} />
        <NavMain label="Sales" items={data.navSales} />
        <NavMain label="System" items={data.navSystem} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
