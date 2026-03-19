import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import ProductReports from "@/components/reports/product-reports"

export const metadata: Metadata = {
    title: "Revenue | E-Commerce Dashboard",
    description: "Manage your revenue",
}

export default function ReportProductsPage() {
    return (
        <DashboardShell>
            <ProductReports />
        </DashboardShell>
    )
}
