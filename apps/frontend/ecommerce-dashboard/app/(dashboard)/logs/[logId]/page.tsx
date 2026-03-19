// src/app/log-system/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogDetailForm } from '@/components/logs/log-detail-form';
import { useGetSystemLog } from '@/hooks/use-logs';

export default function LogDetailPage() {
    const params = useParams();
    const logId = params.logId as string;
    const { data, isLoading, error } = useGetSystemLog(logId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mt-2 text-muted-foreground">Đang tải dữ liệu log...</span>
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    Không thể tải thông tin log. Vui lòng thử lại sau hoặc kiểm tra ID log.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Xem chi tiết System Log</CardTitle>
                <CardDescription>
                    Thông tin chi tiết của log &quot;{data.data.eventName}&quot;.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LogDetailForm log={data.data} />
            </CardContent>
        </Card>
    );
}