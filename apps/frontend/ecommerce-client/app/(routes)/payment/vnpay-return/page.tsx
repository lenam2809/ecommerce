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
        const success = searchParams.get("success") === "True" || searchParams.get("success") === "true"
        const responseCode = searchParams.get("vnp_ResponseCode")

        if (success && responseCode === "00") {
            setStatus("success")
            setMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.")
        } else {
            setStatus("error")
            setMessage(
                success ? "Thanh toán thành công nhưng có lỗi xử lý." : "Thanh toán thất bại hoặc bị hủy bởi người dùng."
            )
        }
    }, [searchParams])

    return (
        <div className="container-app py-12 md:py-20 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            {status === "loading" && (
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent" />
                    <p className="text-small text-ink-soft">Đang xác thực kết quả thanh toán từ VNPAY...</p>
                </div>
            )}

            {status === "success" && (
                <div className="bg-card border border-line rounded-3xl p-8 md:p-12 shadow-xs max-w-lg w-full space-y-6">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-tiny font-bold uppercase tracking-wider mb-2">
                            <span>Giao dịch thành công</span>
                        </div>
                        <h1 className="text-h2 font-bold tracking-tight text-ink">Thanh toán hoàn tất!</h1>
                        <p className="text-ink-soft text-small mt-2 leading-relaxed">
                            Cảm ơn bạn đã tin tưởng mua sắm tại ShopViet. Đơn hàng của bạn đã được ghi nhận và đang chuẩn bị đóng gói.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-surface-2/60 border border-line/60 p-4 text-tiny text-ink-soft space-y-1.5 text-left">
                        <div className="flex justify-between">
                            <span className="text-ink-faint">Phương thức:</span>
                            <span className="font-semibold text-ink">Cổng thanh toán VNPAY-QR</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink-faint">Thời gian giao:</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Siêu tốc trong 2H nội thành</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink-faint">Hóa đơn điện tử VAT:</span>
                            <span className="font-semibold text-ink">Đã gửi qua email</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Button
                            onClick={() => router.push("/account/orders")}
                            className="rounded-full bg-brand text-white hover:bg-brand-hover h-11 px-6 text-small font-semibold shadow-xs"
                        >
                            Theo dõi đơn hàng
                        </Button>
                        <Button
                            onClick={() => router.push("/")}
                            variant="outline"
                            className="rounded-full border-line text-ink hover:bg-surface h-11 px-6 text-small font-semibold"
                        >
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="bg-card border border-line rounded-3xl p-8 md:p-12 shadow-xs max-w-lg w-full space-y-6">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-2xs">
                        <XCircle className="w-10 h-10" />
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-tiny font-bold uppercase tracking-wider mb-2">
                            <span>Giao dịch chưa hoàn tất</span>
                        </div>
                        <h1 className="text-h2 font-bold tracking-tight text-ink">Thanh toán không thành công</h1>
                        <p className="text-ink-soft text-small mt-2 leading-relaxed">
                            {message || "Giao dịch bị gián đoạn hoặc hủy bỏ bởi người dùng."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Button
                            onClick={() => router.push("/checkout")}
                            className="rounded-full bg-brand text-white hover:bg-brand-hover h-11 px-6 text-small font-semibold shadow-xs"
                        >
                            Thử lại thanh toán
                        </Button>
                        <Button
                            onClick={() => router.push("/")}
                            variant="outline"
                            className="rounded-full border-line text-ink hover:bg-surface h-11 px-6 text-small font-semibold"
                        >
                            Về trang chủ
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function VnPayReturnPage() {
    return (
        <Suspense fallback={
            <div className="container-app py-20 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent" />
            </div>
        }>
            <VnPayReturnContent />
        </Suspense>
    )
}
