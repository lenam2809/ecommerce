"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

function VnPayReturnContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        const success = searchParams.get("success") === "True" || searchParams.get("success") === "true";
        const responseCode = searchParams.get("vnp_ResponseCode")
        const orderId = searchParams.get("vnp_TxnRef")

        if (success && responseCode === "00") {
            setStatus("success")
            setMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.")
            // Optional: Clear cart again if needed or ensure it's cleared
        } else {
            setStatus("error")
            setMessage(
                success ? "Thanh toán thành công nhưng có lỗi xử lý." : "Thanh toán thất bại hoặc bị hủy."
            )
        }
    }, [searchParams])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            {status === "loading" && (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            )}

            {status === "success" && (
                <div className="space-y-6">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                    <h1 className="text-3xl font-bold text-green-600">Thanh toán thành công!</h1>
                    <p className="text-muted-foreground text-lg">{message}</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => router.push("/")} variant="outline">
                            Về trang chủ
                        </Button>
                        <Button onClick={() => router.push("/account/orders")}>
                            Xem đơn hàng
                        </Button>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="space-y-6">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                    <h1 className="text-3xl font-bold text-red-600">Thanh toán thất bại</h1>
                    <p className="text-muted-foreground text-lg">{message}</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => router.push("/")} variant="outline">
                            Về trang chủ
                        </Button>
                        <Button onClick={() => router.push("/checkout")}>
                            Thử lại
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function VnPayReturnPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VnPayReturnContent />
        </Suspense>
    )
}
