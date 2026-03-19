// app/permissions/page.tsx
import { Metadata } from "next";
import { GenericList } from "@/components/generic/generic-list";
import { permissionListConfig } from "@/config/permission-list-config";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
    title: "Quản lý quyền hệ thống",
    description: "Quản lý các quyền hệ thống trong ứng dụng",
};


export default function PermissionsPage() {
    return (
        <DashboardShell>
            <GenericList config={permissionListConfig} />
        </DashboardShell>

    );
}