// pages/log-system.tsx
import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GenericList } from "@/components/generic/generic-list"
import { logSystemListConfig } from "@/config/log-system-list-config"

export const metadata: Metadata = {
    title: "Nhật ký hệ thống | Bảng điều khiển AuthFlow",
    description: "Xem và quản lý nhật ký hệ thống",
}

export default function LogSystemPage() {
    return (
        <DashboardShell>
            <GenericList config={logSystemListConfig} />
        </DashboardShell>
    )
}