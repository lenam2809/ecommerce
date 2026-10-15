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

    const orderId = searchParams.get("orderId") || searchParams.get("vnp_TxnRef")

    useEffect(() => {
        const success = searchParams.get("success") === "True" || searchParams.get("success") === "true"
        const responseCode = searchParams.get("vnp_ResponseCode")

        if (success || responseCode === "00") {
            setStatus("success")
            setMessage("Thanh toán thành công! Cảm ơn bạn đã mua sắm tại ShopViet.")
        } else {
            setStatus("error")
            setMessage(
                success ? "Thanh toán thành công nhưng có lỗi xử lý." : "Thanh toán thất bại hoặc bị hủy bởi người dùng."
            )
        }
    }, [searchParams])

    return (
        <div className="container-app py-10 md:py-16 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            {status === "loading" && (
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand border-t-transparent" />
                    <p className="text-small text-ink-soft">Đang xác thực kết quả thanh toán từ VNPAY...</p>
                </div>
            )}

            {status === "success" && (
                <div className="max-w-2xl w-full space-y-6">
                    {/* Animated Status Badge */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card border border-line shadow-[0_0_35px_rgba(5,150,105,0.25)] mb-2 animate-pulse">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {orderId && (
                            <div>
                                <span className="px-3.5 py-1 rounded-full bg-surface-2 border border-line text-ink-soft text-tiny font-mono tracking-wider">
                                    MÃ ĐƠN HÀNG: #{orderId}
                                </span>
                            </div>
                        )}
                        <h1 className="text-h2 md:text-h1 font-bold tracking-tight text-ink">
                            Đặt hàng & Thanh toán thành công!
                        </h1>
                        <p className="text-ink-soft text-small max-w-lg mx-auto leading-relaxed">
                            Cảm ơn bạn đã mua sắm tại ShopViet. Chi tiết đơn hàng và hóa đơn điện tử VAT đã được gửi tới email của bạn.
                        </p>
                    </div>

                    {/* Realtime Express Dispatch Pill */}
                    <div>
                        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-2 px-5 rounded-full bg-card border border-line text-tiny shadow-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="font-semibold text-ink">Dự kiến giao hàng:</span>
                                <span className="text-brand font-semibold">Hôm nay, trước 18:00 (Giao siêu tốc 2H)</span>
                            </div>
                            <span className="text-line hidden sm:inline">|</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-2 text-ink-faint text-[11px]">
                                Đang điều phối shipper
                            </span>
                        </div>
                    </div>

                    {/* Details Box */}
                    <div className="rounded-3xl bg-card border border-line p-6 text-left shadow-xs space-y-3">
                        <h3 className="text-small font-semibold text-ink pb-2 border-b border-line/60">
                            Thông tin đơn hàng
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-tiny">
                            <div>
                                <span className="text-ink-faint block">Phương thức thanh toán:</span>
                                <span className="font-semibold text-ink">
                                    {searchParams.get("vnp_ResponseCode") ? "Cổng VNPAY-QR" : "Thanh toán khi nhận hàng (COD)"}
                                </span>
                            </div>
                            <div>
                                <span className="text-ink-faint block">Thời gian đặt:</span>
                                <span className="font-semibold text-ink">
                                    {new Date().toLocaleString("vi-VN")}
                                </span>
                            </div>
                            <div>
                                <span className="text-ink-faint block">Dịch vụ vận chuyển:</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    ShopViet Express (Miễn phí vận chuyển)
                                </span>
                            </div>
                            <div>
                                <span className="text-ink-faint block">Bảo hành ủy quyền:</span>
                                <span className="font-semibold text-ink">
                                    24 tháng chính hãng · 1 đổi 1 trong 30 ngày
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 justify-center pt-2">
                        <Button
                            onClick={() => router.push("/account/orders")}
                            className="rounded-full bg-brand text-white hover:bg-brand-hover h-11 px-7 text-small font-semibold shadow-xs"
                        >
                            Theo dõi đơn hàng
                        </Button>
                        <Button
                            onClick={() => window.print()}
                            variant="outline"
                            className="rounded-full border-line text-ink hover:bg-surface h-11 px-6 text-small font-semibold no-print"
                        >
                            In hóa đơn
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
