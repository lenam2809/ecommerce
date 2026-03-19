import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import AccountTabs from "@/components/account/account-tabs"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata: Metadata = {
    title: "Tài khoản",
    description: "Quản lý cài đặt và tùy chọn tài khoản của bạn.",
}

export default function AccountPage() {
    return (
        <DashboardShell>
            <DashboardHeader heading="Tài khoản" text="Quản lý cài đặt và tùy chọn tài khoản của bạn.">
            </DashboardHeader>
            <Separator />
            <AccountTabs />
        </DashboardShell>
    )
}
