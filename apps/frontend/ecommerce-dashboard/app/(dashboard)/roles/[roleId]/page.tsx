// src/app/roles/[id]/edit/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useGetRole } from '@/hooks/use-roles';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RoleEditForm } from '@/components/roles/role-edit-form';

export default function DetailRolePage() {
    const params = useParams();
    const roleId = params.roleId as string;
    const { data, isLoading, error } = useGetRole(roleId);
    const role = data?.data; // Giả sử API trả về cấu trúc { data: Role }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu vai trò...</span>
            </div>
        );
    }

    if (error || !role) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin vai trò. Vui lòng thử lại sau hoặc kiểm tra ID vai trò.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Xem chi tiết vai trò</CardTitle>
                <CardDescription>
                    Cập nhật thông tin cho vai trò &quot;{role.name}&quot;
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RoleEditForm role={role} isDetail={true} />
            </CardContent>
        </Card>

    );
}