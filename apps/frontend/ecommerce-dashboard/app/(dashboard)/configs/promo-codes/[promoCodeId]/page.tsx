// src/app/categories/[id]/edit/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useGetPromoCode } from '@/hooks/use-promo-codes';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PromoCodeEditForm } from '@/components/promo-codes/promo-code-edit-form';

export default function DetailPromoCodePage() {
    const params = useParams();
    const promoCodeId = params.promoCodeId as string;
    const { data, isLoading, error } = useGetPromoCode(promoCodeId);
    const promoCode = data?.data; // Giả sử API trả về cấu trúc { data: PromoCode }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu promo-code...</span>
            </div>
        );
    }

    if (error || !promoCode) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin promo-code. Vui lòng thử lại sau hoặc kiểm tra ID promo-code.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Xem chi tiết promo-code</CardTitle>
                <CardDescription>
                    Thông tin promo-code &quot;{promoCode.code}&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PromoCodeEditForm promoCode={promoCode} isDetail={true} />
            </CardContent>
        </Card>

    );
}