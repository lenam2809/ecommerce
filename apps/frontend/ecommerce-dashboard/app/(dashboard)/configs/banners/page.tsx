import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { bannerListConfig } from "@/config/banner-list-config"

export const metadata: Metadata = {
    title: "Banners | E-Commerce Dashboard",
    description: "Manage your banners",
}

export default function BannersPage() {
    return (
        <DashboardShell>
            <GenericList config={bannerListConfig} />
        </DashboardShell>
    )
}