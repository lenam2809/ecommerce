"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    CheckCircle2,
    XCircle,
    Download,
    PackageCheck,
    Truck,
    ShieldCheck,
    Clock,
    RefreshCw,
    ArrowRight,
    FileText,
    Mail,
    PhoneCall,
} from "lucide-react"
import { useOrder } from "@/hooks/use-orders"
import { formatPrice } from "@/lib/contants"

type VnPayState = "success" | "failed" | "processing"

function VnPayReturnContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<VnPayState>("success")
    const [holdSeconds, setHoldSeconds] = useState<number>(30 * 60) // 30-minute countdown

    const rawOrderId = searchParams.get("orderId") || searchParams.get("vnp_TxnRef") || ""
    const transactionId = searchParams.get("vnp_TransactionNo") || searchParams.get("vnp_BankTranNo") || "—"

    const { data: order } = useOrder(rawOrderId)

    const displayOrderId = order?.code || rawOrderId || "—"
    const normalizedOrderId = displayOrderId.startsWith("#") ? displayOrderId : `#${displayOrderId}`
    const customerName = order?.userName || order?.guestName || "Quý khách"
    const customerEmail = order?.email || ""
    const orderTotal = order?.totalAmount ? formatPrice(order.totalAmount) : "—"

    useEffect(() => {
        const stateParam = searchParams.get("state")
        const successParam = searchParams.get("success")
        const responseCode = searchParams.get("vnp_ResponseCode")

        if (stateParam === "failed" || successParam === "false" || successParam === "False" || (responseCode && responseCode !== "00")) {
            setStatus("failed")
        } else if (stateParam === "processing") {
            setStatus("processing")
        } else {
            setStatus("success")
        }
    }, [searchParams])

    // 30-minute Order Hold Countdown Timer for Failed state
    useEffect(() => {
        if (status !== "failed") return
        const timer = setInterval(() => {
            setHoldSeconds((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [status])

    const minutes = String(Math.floor(holdSeconds / 60)).padStart(2, "0")
    const seconds = String(holdSeconds % 60).padStart(2, "0")

    const handleDownloadVatPdf = () => {
        toast.success(`Đang chuẩn bị Hóa đơn điện tử GTGT (PDF) — Đơn ${normalizedOrderId}...`)
    }

    const handleSwitchToCod = () => {
        toast.success(`Đã ghi nhận yêu cầu chuyển đơn hàng ${normalizedOrderId} sang COD!`)
        setStatus("success")
    }

    return (
        <div className="min-h-screen bg-background text-ink py-8 md:py-12">
            <div className="container-app max-w-4xl mx-auto px-4 space-y-6">
                {/* STATE 1: SUCCESS */}
                {status === "success" && (
                    <div className="rounded-3xl bg-card border border-line p-6 md:p-10 shadow-sm space-y-8">
                        {/* Header Banner */}
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
                            </div>

                            <div className="inline-flex flex-wrap items-center justify-center gap-2">
                                <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold font-mono tabular-nums">
                                    ĐÃ XÁC NHẬN THANH TOÁN
                                </span>
                                <span className="px-3.5 py-1 rounded-full bg-surface text-ink text-xs font-extrabold font-mono tabular-nums">
                                    Mã đơn: {normalizedOrderId}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
                                Cảm ơn {customerName}! Đơn hàng đã thanh toán thành công
                            </h1>
                            <p className="text-ink-soft text-sm max-w-xl leading-relaxed">
                                Hóa đơn điện tử VAT và phiếu bảo hành điện tử chính hãng đã được ghi nhận vào hệ thống
                                {customerEmail && (
                                    <>
                                        {" "}và gửi tới <strong className="text-ink">{customerEmail}</strong>
                                    </>
                                )}.
                            </p>
                        </div>

                        {/* Delivery Stepper */}
                        <div className="rounded-2xl bg-surface/50 border border-line p-5 md:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-tech-blue" />
                                    <span className="text-sm font-extrabold text-ink">
                                        Hành trình vận chuyển ({order?.deliveryMethod || "Giao siêu tốc ShopViet"})
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                                    {order?.expectedDeliveryDate || "Dự kiến giao trong ngày"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                {[
                                    {
                                        step: "Bước 1",
                                        title: "Thanh toán VNPAY",
                                        time: "Đã hoàn tất",
                                        done: true,
                                    },
                                    {
                                        step: "Bước 2",
                                        title: "Đóng gói niêm phong",
                                        time: "Kho trung tâm ShopViet",
                                        active: true,
                                    },
                                    {
                                        step: "Bước 3",
                                        title: "Bàn giao vận chuyển",
                                        time: "Đang điều phối",
                                        done: false,
                                    },
                                    {
                                        step: "Bước 4",
                                        title: "Giao tận tay & Đồng kiểm",
                                        time: "Kiểm tra Serial/IMEI",
                                        done: false,
                                    },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-xl p-3.5 border ${
                                            item.done
                                                ? "border-emerald-500/30 bg-emerald-500/10"
                                                : item.active
                                                ? "border-tech-blue bg-tech-blue/10 ring-2 ring-tech-blue/20"
                                                : "border-line bg-card opacity-60"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-tech-blue">
                                                {item.step}
                                            </span>
                                            {item.done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                            {item.active && (
                                                <span className="h-2.5 w-2.5 rounded-full bg-tech-blue animate-ping" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-ink">{item.title}</p>
                                        <p className="text-[11px] text-ink-soft mt-1 font-mono tabular-nums">
                                            {item.time}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transaction Receipt Grid */}
                        <div className="rounded-2xl border border-line p-5 md:p-6 space-y-4 bg-card">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
                                <h3 className="text-sm font-extrabold text-ink flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-tech-blue" />
                                    Chi tiết biên lai giao dịch điện tử
                                </h3>
                                <Button
                                    type="button"
                                    onClick={handleDownloadVatPdf}
                                    variant="outline"
                                    className="h-9 px-3.5 rounded-xl border-tech-blue/30 text-tech-blue hover:bg-tech-blue/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Tải hóa đơn VAT (PDF)</span>
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-ink-soft block">Mã đơn hàng:</span>
                                    <span className="font-extrabold text-ink text-sm font-mono tabular-nums">
                                        {normalizedOrderId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-ink-soft block">Mã giao dịch VNPAY:</span>
                                    <span className="font-extrabold text-tech-blue text-sm font-mono tabular-nums">
                                        {transactionId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-ink-soft block">Tổng tiền thanh toán:</span>
                                    <span className="font-extrabold text-brand text-sm font-mono tabular-nums whitespace-nowrap">
                                        {orderTotal}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-ink-soft block">Phương thức:</span>
                                    <span className="font-bold text-ink">
                                        {order?.paymentMethod || "Cổng VNPAY"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-ink-soft block">Địa chỉ giao hàng:</span>
                                    <span className="font-bold text-ink line-clamp-1">
                                        {order?.shippingAddress || "Tại 45 Showroom ShopViet"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-ink-soft block">Bảo hành điện tử:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        Kích hoạt tự động theo Serial
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center pt-2">
                            <Button
                                onClick={() => router.push(order?.id ? `/account/orders/${order.id}` : "/account/orders")}
                                className="rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 h-12 px-7 text-sm font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                            >
                                <PackageCheck className="h-4 w-4" />
                                <span>Xem chi tiết &amp; Serial thiết bị</span>
                            </Button>
                            <Button
                                onClick={handleDownloadVatPdf}
                                variant="outline"
                                className="rounded-xl border-line text-ink hover:bg-surface h-12 px-6 text-sm font-bold flex items-center gap-2 cursor-pointer"
                            >
                                <Download className="h-4 w-4" />
                                <span>Tải hóa đơn VAT (PDF)</span>
                            </Button>
                            <Button
                                onClick={() => router.push("/products")}
                                variant="outline"
                                className="rounded-xl border-line text-ink hover:bg-surface h-12 px-6 text-sm font-bold cursor-pointer"
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </div>
                    </div>
                )}

                {/* STATE 2: FAILED */}
                {status === "failed" && (
                    <div className="rounded-3xl bg-card border border-line p-6 md:p-10 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
                        <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/40 text-brand flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 stroke-[2.2]" />
                        </div>

                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-brand text-xs font-extrabold uppercase tracking-wider font-mono tabular-nums">
                                Giao dịch chưa hoàn tất • Đơn hàng {normalizedOrderId}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
                                Thanh toán qua VNPAY không thành công
                            </h1>
                            <p className="text-ink-soft text-sm max-w-lg mx-auto leading-relaxed">
                                Phiên xác thực ngân hàng đã hết hạn hoặc giao dịch đã bị hủy trên cổng VNPAY. Tài khoản của quý khách <strong>chưa bị trừ tiền</strong>.
                            </p>
                        </div>

                        {/* 30-Minute Order Reservation Countdown Box */}
                        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-ink">
                                        Hệ thống giữ đơn hàng &amp; suất ưu đãi trong 30 phút
                                    </p>
                                    <p className="text-xs text-ink-soft">
                                        Quý khách có thể thực hiện thanh toán lại hoặc chuyển sang thanh toán khi nhận hàng (COD).
                                    </p>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-slate-950 text-white font-extrabold text-base font-mono tabular-nums whitespace-nowrap shrink-0">
                                {minutes} : {seconds}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button
                                onClick={() => router.push(order?.id ? `/checkout?orderId=${order.id}` : "/checkout")}
                                className="rounded-xl bg-brand hover:bg-brand/90 text-white h-12 px-7 text-sm font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer font-mono tabular-nums"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Thanh toán lại {orderTotal !== "—" ? `• ${orderTotal}` : ""}</span>
                            </Button>
                            <Button
                                onClick={handleSwitchToCod}
                                variant="outline"
                                className="rounded-xl border-tech-blue text-tech-blue hover:bg-tech-blue/5 h-12 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Đổi sang thanh toán COD</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <p className="text-xs text-ink-soft pt-2">
                            Cần hỗ trợ thanh toán? Hotline bán hàng miễn phí{" "}
                            <strong className="text-tech-blue font-mono tabular-nums whitespace-nowrap">1800 6868</strong> (08:00 - 22:00)
                        </p>
                    </div>
                )}

                {/* STATE 3: PROCESSING */}
                {status === "processing" && (
                    <div className="rounded-3xl bg-card border border-line p-8 md:p-12 shadow-sm max-w-2xl mx-auto text-center space-y-6">
                        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-tech-blue/20 border-t-tech-blue animate-spin" />
                            <ShieldCheck className="w-8 h-8 text-tech-blue" />
                        </div>

                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tech-blue/10 text-tech-blue text-xs font-extrabold uppercase tracking-wider font-mono tabular-nums">
                                ĐANG ĐỐI SOÁT LIÊN NGÂN HÀNG • {transactionId}
                            </span>
                            <h1 className="text-2xl font-extrabold text-ink">
                                Đang đồng bộ kết quả thanh toán từ VNPAY...
                            </h1>
                            <p className="text-sm text-ink-soft max-w-lg mx-auto leading-relaxed">
                                Hệ thống đang tiếp nhận tín hiệu IPN từ cổng thanh toán cho đơn hàng{" "}
                                <strong className="text-ink font-mono tabular-nums">{normalizedOrderId}</strong>. Quá trình đối soát thường mất từ 5 - 15 giây.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-surface border border-line p-4 text-left space-y-2 text-xs text-ink-soft">
                            <div className="flex items-center gap-2 font-bold text-ink">
                                <Mail className="h-4 w-4 text-tech-blue" />
                                <span>Thông tin xác nhận giao dịch:</span>
                            </div>
                            <p>
                                • Sau khi đối soát hoàn tất, hóa đơn VAT điện tử và mã vận đơn sẽ được đồng bộ trực tiếp vào tài khoản của quý khách.
                            </p>
                            <p className="flex items-center gap-1.5">
                                <PhoneCall className="h-3.5 w-3.5 text-tech-blue shrink-0" />
                                <span>Hotline hỗ trợ đối soát thanh toán: <strong className="text-ink font-mono tabular-nums whitespace-nowrap">1800 6868</strong></span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button
                                onClick={() => typeof window !== "undefined" && window.location.reload()}
                                className="rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 h-11 px-6 text-xs font-bold cursor-pointer"
                            >
                                Kiểm tra lại trạng thái
                            </Button>
                            <Button
                                onClick={() => router.push("/account/orders")}
                                variant="outline"
                                className="rounded-xl border-line h-11 px-6 text-xs font-bold cursor-pointer text-ink"
                            >
                                Về lịch sử đơn hàng
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function VnPayReturnPage() {
    return (
        <Suspense
            fallback={
                <div className="container-app py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-tech-blue border-t-transparent" />
                </div>
            }
        >
            <VnPayReturnContent />
        </Suspense>
    )
}
