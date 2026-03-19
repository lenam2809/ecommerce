import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { accountLockListConfig } from "@/config/account-lock-list-config"

export const metadata: Metadata = {
    title: "Tài khoản bị khóa | Admin Dashboard",
    description: "Quản lý danh sách tài khoản bị khóa",
}

export default function AccountLocksPage() {
    return (
        <DashboardShell>
            <GenericList config={accountLockListConfig} />
        </DashboardShell>
    )
}