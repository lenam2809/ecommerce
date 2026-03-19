'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error để debug
        logger.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-destructive/10 p-3">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                    Đã xảy ra lỗi!
                </h2>
                <p className="text-center text-muted-foreground max-w-md">
                    Có lỗi xảy ra khi tải trang dashboard. Vui lòng thử lại.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground">
                        Mã lỗi: {error.digest}
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                <Button onClick={reset} variant="default" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                </Button>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/dashboard">
                        <Home className="h-4 w-4" />
                        Về trang chủ
                    </Link>
                </Button>
            </div>
        </div>
    );
}
