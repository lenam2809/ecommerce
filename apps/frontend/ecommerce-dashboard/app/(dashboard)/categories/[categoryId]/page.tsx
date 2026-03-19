"use client";

import { useParams } from 'next/navigation';
import { useGetCategory } from '@/hooks/use-categories';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EditCategoryForm } from '@/components/categories/category-edit-form';

export default function DetailCategoryPage() {
    const params = useParams();
    const categoryId = params.categoryId as string;
    const { data, isLoading, error } = useGetCategory(categoryId);
    const category = data?.data; // Giả sử API trả về cấu trúc { data: Category }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu sản phẩm...</span>
            </div>
        );
    }

    if (error || !category) {
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
                <CardTitle>Xem chi tiết sản phẩm</CardTitle>
                <CardDescription>
                    Thông tin danh mục sản phẩm &quot;{category.name}&quot;
                </CardDescription>
            </CardHeader>
            <CardContent>
                <EditCategoryForm category={category} isDetail={true} />
            </CardContent>
        </Card>

    );
}