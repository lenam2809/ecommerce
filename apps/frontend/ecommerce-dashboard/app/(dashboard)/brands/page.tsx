import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { brandListConfig } from "@/config/brand-list-config"

export const metadata: Metadata = {
    title: "Brands | E-Commerce Dashboard",
    description: "Manage your brands",
}

export default function BrandsPage() {
    return (
        <DashboardShell>
            <GenericList config={brandListConfig} />
        </DashboardShell>
    )
}
