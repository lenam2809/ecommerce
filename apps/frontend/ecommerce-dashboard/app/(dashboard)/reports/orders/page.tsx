import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import OrderReports from "@/components/reports/order-reports"

export const metadata: Metadata = {
    title: "Revenue | E-Commerce Dashboard",
    description: "Manage your revenue",
}

export default function ReportOrdersPage() {
    return (
        <DashboardShell>
            <OrderReports />
        </DashboardShell>
    )
}
