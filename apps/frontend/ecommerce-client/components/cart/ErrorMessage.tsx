// components/cart/ErrorMessage.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

const ErrorMessage = () => {
    return (
        <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Không thể tải giỏ hàng</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Có lỗi xảy ra khi tải thông tin giỏ hàng của bạn. Vui lòng thử lại sau.</p>
            <Button
                onClick={() => window.location.reload()}
                className="bg-[#2A5CAA] hover:bg-[#1e4785] transition-colors duration-150 flex items-center"
            >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Thử lại
            </Button>
        </div>
    );
};

export default ErrorMessage;