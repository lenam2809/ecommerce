// components/cart/ErrorMessage.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

const ErrorMessage = () => {
    return (
        <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/5 rounded-full mb-6">
                <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-h2 font-semibold mb-4 text-ink">Không thể tải giỏ hàng</h1>
            <p className="text-ink-soft mb-6 max-w-md mx-auto">Có lỗi xảy ra khi tải thông tin giỏ hàng của bạn. Vui lòng thử lại sau.</p>
            <Button
                onClick={() => window.location.reload()}
                className="h-11 px-6 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold transition-colors flex items-center"
            >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Thử lại
            </Button>
        </div>
    );
};

export default ErrorMessage;
