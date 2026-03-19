"use client";

import { useParams } from 'next/navigation';
import { useGetBrand } from '@/hooks/use-brands';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EditBrandForm } from '@/components/brands/brand-edit-form';

export default function DetailBrandPage() {
    const params = useParams();
    const brandId = params.brandId as string;
    const { data, isLoading, error } = useGetBrand(brandId);
    const brand = data?.data; // Giả sử API trả về cấu trúc { data: Brand }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu thương hiệu...</span>
            </div>
        );
    }

    if (error || !brand) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin thương hiệu. Vui lòng thử lại sau hoặc kiểm tra ID thương hiệu.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Chỉnh sửa thương hiệu</CardTitle>
                <CardDescription>
                    Cập nhật thông tin cho thương hiệu &quot;{brand.name}&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <EditBrandForm brand={brand} isDetail={false} />
            </CardContent>
        </Card>

    );
}