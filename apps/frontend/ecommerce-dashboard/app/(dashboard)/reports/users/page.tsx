import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import UserReports from "@/components/reports/user-reports"

export const metadata: Metadata = {
    title: "Revenue | E-Commerce Dashboard",
    description: "Manage your revenue",
}

export default function UserReportPage() {
    return (
        <DashboardShell>
            <UserReports />
        </DashboardShell>
    )
}
