// src/app/Users/[id]/edit/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useGetUser } from '@/hooks/use-users';
import { UserEditForm } from '@/components/users/user-edit-form';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DetailUserPage() {
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
                    Không thể tải thông tin sản phẩm. Vui lòng thử lại sau hoặc kiểm tra ID sản phẩm.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Xem chi tiết người dùng</CardTitle>
                <CardDescription>
                    Thông tin người dùng &quot;{user.lastName + ' ' + user.firstName}&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UserEditForm user={user} isDetail={true} />
            </CardContent>
        </Card>

    );
}