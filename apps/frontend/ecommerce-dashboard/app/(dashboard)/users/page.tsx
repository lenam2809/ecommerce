import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { userListConfig } from "@/config/user-list-config"

export const metadata: Metadata = {
    title: "Users | E-Commerce Dashboard",
    description: "Manage your users",
}

export default function UsersPage() {
    return (
        <DashboardShell>
            <GenericList config={userListConfig} />
        </DashboardShell>
    )
}
