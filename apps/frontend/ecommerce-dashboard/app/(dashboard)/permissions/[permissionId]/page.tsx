// src/app/permissions/[id]/edit/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useGetPermission } from '@/hooks/use-permissions';
import { EditPermissionForm } from '@/components/permissions/permission-edit-form';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DetailPermissionPage() {
    const params = useParams();
    const permissionId = params.permissionId as string;
    const { data, isLoading, error } = useGetPermission(permissionId);
    const permission = data?.data; // Giả sử API trả về cấu trúc { data: Permission }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu quyền...</span>
            </div>
        );
    }

    if (error || !permission) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin quyền. Vui lòng thử lại sau hoặc kiểm tra ID quyền.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Xem chi tiết quyền</CardTitle>
                <CardDescription>
                    Cập nhật thông tin cho quyền &quot;{permission.name}&quot;
                </CardDescription>
            </CardHeader>
            <CardContent>
                <EditPermissionForm permission={permission} isDetail={true} />
            </CardContent>
        </Card>

    );
}