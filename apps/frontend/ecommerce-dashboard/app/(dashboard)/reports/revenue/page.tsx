import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import RevenueReports from "@/components/reports/revenue-reports"

export const metadata: Metadata = {
    title: "Revenue | E-Commerce Dashboard",
    description: "Manage your revenue",
}

export default function RevenuePage() {
    return (
        <DashboardShell>
            <RevenueReports />
        </DashboardShell>
    )
}
