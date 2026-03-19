"use client";


import { UserPermissionAssignment } from "@/components/permissions/user-permission-assignment";
import { FormSection } from "@/components/ui/form-section";
import { useParams } from "next/navigation";
import { useGetUser } from "@/hooks/use-users";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";



export default function UserPermissionsPage() {
    const params = useParams();
    const UserId = params.userId as string;
    const { data, isLoading, error } = useGetUser(UserId);
    const user = data?.data; // Giả sử API trả về cấu trúc { data: User }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu người dùng...</span>
            </div>
        );
    }

    if (error || !user) {
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
        <FormSection title="Quản lý quyền người dùng" description="Phân quyền cho người dùng trong hệ thống">
            <UserPermissionAssignment userId={user.id} userName={user.fullName} />
        </FormSection>
    );
}