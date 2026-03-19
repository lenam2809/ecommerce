import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { categoryListConfig } from "@/config/category-list-config"

export const metadata: Metadata = {
    title: "Categories | E-Commerce Dashboard",
    description: "Manage your categories",
}

export default function CategoriesPage() {
    return (
        <DashboardShell>
            <GenericList config={categoryListConfig} />
        </DashboardShell>
    )
}
