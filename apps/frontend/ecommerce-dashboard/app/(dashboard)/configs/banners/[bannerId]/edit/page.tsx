"use client";

import { useParams } from 'next/navigation';
import { useGetBanner } from '@/hooks/use-banners';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EditBannerForm } from '@/components/banners/banner-edit-form';

export default function DetailBannerPage() {
    const params = useParams();
    const bannerId = params.bannerId as string;
    const { data, isLoading, error } = useGetBanner(bannerId);
    const banner = data?.data; // Giả sử API trả về cấu trúc { data: Banner }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu banner...</span>
            </div>
        );
    }

    if (error || !banner) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin banner. Vui lòng thử lại sau hoặc kiểm tra ID banner.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Chỉnh sửa banner</CardTitle>
                <CardDescription>
                    Cập nhật thông tin cho banner &quot;{banner.title}&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <EditBannerForm banner={banner} isDetail={false} />
            </CardContent>
        </Card>

    );
}