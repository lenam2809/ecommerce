import Dashboard from "@/components/dashboard/dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Admin Panel",
  description: "Trang quản trị hệ thống bán hàng",
}

export default function DashboardPage() {
  return <Dashboard />
}
