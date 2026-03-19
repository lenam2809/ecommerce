"use client";


import { RolePermissionAssignment } from "@/components/permissions/role-permission-assignment";
import { FormSection } from "@/components/ui/form-section";
import { useParams } from "next/navigation";
import { useGetRole } from "@/hooks/use-roles";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";



export default function RolePermissionsPage() {
    const params = useParams();
    const RoleId = params.roleId as string;
    const { data, isLoading, error } = useGetRole(RoleId);
    const role = data?.data; // Giả sử API trả về cấu trúc { data: Role }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu người dùng...</span>
            </div>
        );
    }

    if (error || !role) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin người dùng. Vui lòng thử lại sau hoặc kiểm tra ID người dùng.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <FormSection title="Quản lý vai trò người dùng" description="Phân vai trò cho người dùng trong hệ thống">
            <RolePermissionAssignment roleId={role.id} roleName={role.name} />
        </FormSection>
    );
}