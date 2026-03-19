'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error để debug
        logger.error('App Error:', error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4">
            <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-destructive/10 p-3">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                    Đã xảy ra lỗi!
                </h2>
                <p className="text-center text-muted-foreground max-w-md">
                    Có lỗi xảy ra khi tải trang. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu lỗi tiếp tục.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground">
                        Mã lỗi: {error.digest}
                    </p>
                )}
            </div>
            <Button onClick={reset} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Thử lại
            </Button>
        </div>
    );
}
