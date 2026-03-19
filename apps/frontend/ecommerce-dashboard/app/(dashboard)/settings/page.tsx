import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsForm } from "@/components/settings/settings-form"

export const metadata: Metadata = {
  title: "Cài đặt | E-Commerce Dashboard",
  description: "Quản lý cài đặt tài khoản của bạn",
}

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Cài đặt" text="Quản lý cài đặt tài khoản của bạn" />
      <div className="grid gap-8">
        <SettingsForm />
      </div>
    </DashboardShell>
  )
}
