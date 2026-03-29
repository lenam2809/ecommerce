"use client";

import { useParams } from 'next/navigation';
import { useGetMarquees } from '@/hooks/use-marquees';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MarqueeEditForm } from '@/components/marquee/marquee-edit-form';

export default function MarqueeEditPage() {
    const params = useParams();
    const marqueeId = params.marqueeId as string;

    const { data, isLoading, isError } = useGetMarquees();
    const marquee = data?.data?.messages?.find((m) => m.id === marqueeId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu marquee...</span>
            </div>
        );
    }

    if (isError || !marquee) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin tin nhắn marquee. Vui lòng thử lại sau hoặc kiểm tra ID.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Chỉnh sửa tin nhắn Marquee</CardTitle>
                <CardDescription>
                    Cập nhật nội dung tin nhắn marquee.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MarqueeEditForm marquee={marquee} isDetail={false} />
            </CardContent>
        </Card>
    );
}
