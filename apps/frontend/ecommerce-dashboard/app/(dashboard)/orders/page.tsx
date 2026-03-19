import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { GenericList } from "@/components/generic/generic-list"
import { orderListConfig } from "@/config/order-list-config"

export const metadata: Metadata = {
  title: "Orders | E-Commerce Dashboard",
  description: "Manage your orders",
}

export default function OrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Đơn hàng"
        text="Xem và xử lý trạng thái các đơn hàng."
      />
      <GenericList config={orderListConfig} />
    </DashboardShell>
  )
}
