// app/permissions/page.tsx
import { Metadata } from "next";
import { GenericList } from "@/components/generic/generic-list";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { roleListConfig } from "@/config/role-list-config";

export const metadata: Metadata = {
    title: "Quản lý vai trò hệ thống",
    description: "Quản lý các vai trò hệ thống trong ứng dụng",
};


export default function RolesPage() {
    return (
        <DashboardShell>
            <GenericList config={roleListConfig} />
        </DashboardShell>

    );
}