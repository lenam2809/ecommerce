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

type VnPayState = "success" | "failed" | "processing"

function VnPayReturnContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<VnPayState>("success")
    const [holdSeconds, setHoldSeconds] = useState<number>(29 * 60 + 48) // 29:48 countdown

    const rawOrderId = searchParams.get("orderId") || searchParams.get("vnp_TxnRef") || "ORD-20261019-8892"
    const normalizedOrderId = rawOrderId.startsWith("#") ? rawOrderId : `#${rawOrderId}`
    const transactionId = searchParams.get("vnp_TransactionNo") || "VNP14298834"

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
        toast.success("Đang tải Hóa đơn điện tử GTGT (PDF) — Mẫu số 01GTKT0/001...")
    }

    const handleSwitchToCod = () => {
        toast.success("Đã chuyển phương thức đơn hàng #ORD-20261019-8892 sang COD (Đặt cọc 10%)!")
        setStatus("success")
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] py-8 md:py-12">
            <div className="container-app max-w-4xl mx-auto px-4 space-y-6">
                {/* Interactive Tri-State Switcher Bar (for seamless QA inspection of D2-05) */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>Trạng thái cổng thanh toán VNPAY:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setStatus("success")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                status === "success"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                        >
                            1. Thanh toán Thành công
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus("failed")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                status === "failed"
                                    ? "bg-[#e11d48] text-white shadow-xs"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                        >
                            2. Giao dịch Thất bại (Giữ đơn 30p)
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus("processing")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                status === "processing"
                                    ? "bg-primary text-white shadow-xs"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                        >
                            3. Đang xử lý đối soát
                        </button>
                    </div>
                </div>

                {/* STATE 1: SUCCESS */}
                {status === "success" && (
                    <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm space-y-8">
                        {/* Header Banner */}
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
                            </div>

                            <div className="inline-flex flex-wrap items-center justify-center gap-2">
                                <span className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold tabular-nums">
                                    ĐÃ XÁC NHẬN THANH TOÁN
                                </span>
                                <span className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-extrabold tabular-nums">
                                    Mã đơn: {normalizedOrderId}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Cảm ơn Nguyễn Minh Quân! Đơn hàng đã thanh toán thành công
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
                                Hóa đơn điện tử VAT và phiếu bảo hành điện tử Apple chính hãng đã được gửi tới{" "}
                                <strong className="text-slate-900 dark:text-white">quan.nguyen@shopviet.vn</strong>.
                            </p>
                        </div>

                        {/* 4-Step GHN Express Delivery Stepper */}
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-5 md:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        Hành trình vận chuyển GHN Express (Giao siêu tốc 2H)
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                    Dự kiến giao: Trước 16:30 hôm nay (19/10/2026)
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                {[
                                    {
                                        step: "Bước 1",
                                        title: "Thanh toán VNPAY",
                                        time: "14:32 • 19/10/2026",
                                        done: true,
                                    },
                                    {
                                        step: "Bước 2",
                                        title: "Đóng gói niêm phong 3 lớp",
                                        time: "Đang thực hiện tại Kho Q.1",
                                        active: true,
                                    },
                                    {
                                        step: "Bước 3",
                                        title: "Bàn giao GHN Express",
                                        time: "Dự kiến 15:00",
                                        done: false,
                                    },
                                    {
                                        step: "Bước 4",
                                        title: "Giao tận tay & Đồng kiểm",
                                        time: "Trước 16:30 • 19/10/2026",
                                        done: false,
                                    },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-xl p-3.5 border ${
                                            item.done
                                                ? "border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/60 dark:bg-emerald-950/30"
                                                : item.active
                                                ? "border-primary bg-blue-50/70 dark:bg-blue-950/30 ring-2 ring-primary/15"
                                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 opacity-75"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                                                {item.step}
                                            </span>
                                            {item.done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                            {item.active && (
                                                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 tabular-nums">
                                            {item.time}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transaction Receipt Grid */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Chi tiết biên lai giao dịch điện tử
                                </h3>
                                <Button
                                    type="button"
                                    onClick={handleDownloadVatPdf}
                                    variant="outline"
                                    className="h-9 px-3.5 rounded-xl border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Tải hóa đơn VAT (PDF)</span>
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400 block">Mã đơn hàng:</span>
                                    <span className="font-extrabold text-slate-900 dark:text-white text-sm tabular-nums">
                                        {normalizedOrderId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400 block">Mã giao dịch VNPAY:</span>
                                    <span className="font-extrabold text-primary text-sm tabular-nums">
                                        {transactionId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400 block">Tổng tiền đã thanh toán:</span>
                                    <span className="font-extrabold text-[#e11d48] text-sm tabular-nums whitespace-nowrap">
                                        62.390.000₫
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400 block">Phương thức thanh toán:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        Cổng VNPAY-QR (Ngân hàng Vietcombank)
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400 block">Thời gian giao dịch:</span>
                                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                        19/10/2026 • 14:32:18
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-600 dark:text-slate-400 block">Điểm thưởng tích lũy:</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                        +620 điểm (Hạng VIP Diamond)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center pt-2">
                            <Button
                                onClick={() => router.push("/account/orders")}
                                className="rounded-xl bg-primary text-white hover:bg-primary/90 h-12 px-7 text-sm font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                            >
                                <PackageCheck className="h-4 w-4" />
                                <span>Quản lý & Theo dõi đơn hàng</span>
                            </Button>
                            <Button
                                onClick={handleDownloadVatPdf}
                                variant="outline"
                                className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 h-12 px-6 text-sm font-bold flex items-center gap-2 cursor-pointer"
                            >
                                <Download className="h-4 w-4" />
                                <span>Tải hóa đơn VAT (PDF)</span>
                            </Button>
                            <Button
                                onClick={() => router.push("/products")}
                                variant="outline"
                                className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 h-12 px-6 text-sm font-bold cursor-pointer"
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </div>
                    </div>
                )}

                {/* STATE 2: FAILED (With 30-Minute Order Hold Countdown & Crimson Retry / Switch to COD) */}
                {status === "failed" && (
                    <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
                        <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500/40 text-[#e11d48] flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 stroke-[2.2]" />
                        </div>

                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-[#e11d48] text-xs font-extrabold uppercase tracking-wider">
                                Giao dịch chưa hoàn tất • Đơn hàng {normalizedOrderId}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Thanh toán qua VNPAY không thành công
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                                Nguyên nhân: Phiên xác thực ngân hàng đã hết hạn hoặc quý khách đã hủy giao dịch trên cổng VNPAY. Tài khoản của quý khách <strong>chưa bị trừ tiền</strong>.
                            </p>
                        </div>

                        {/* 30-Minute Order Reservation Countdown Box */}
                        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                                        Hệ thống đang giữ suất máy & ưu đãi TECHVIP500 trong 30 phút
                                    </p>
                                    <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
                                        Quý khách có thể thanh toán lại ngay hoặc chuyển sang thanh toán COD.
                                    </p>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-[#090D16] text-white font-extrabold text-base tabular-nums whitespace-nowrap shrink-0">
                                {minutes} : {seconds}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button
                                onClick={() => router.push("/checkout")}
                                className="rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white h-12 px-7 text-sm font-extrabold shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer tabular-nums"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Thanh toán lại • 62.390.000₫</span>
                            </Button>
                            <Button
                                onClick={handleSwitchToCod}
                                variant="outline"
                                className="rounded-xl border-primary text-primary hover:bg-primary/5 h-12 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Đổi sang thanh toán COD</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 pt-2">
                            Cần hỗ trợ khẩn cấp? Gọi tổng đài CSKH miễn phí{" "}
                            <strong className="text-primary tabular-nums">1800 6868</strong> (08:00 - 22:00)
                        </p>
                    </div>
                )}

                {/* STATE 3: PROCESSING (IPN Pending) */}
                {status === "processing" && (
                    <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm max-w-2xl mx-auto text-center space-y-6">
                        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>

                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-primary text-xs font-extrabold uppercase tracking-wider tabular-nums">
                                ĐANG ĐỐI SOÁT LIÊN NGÂN HÀNG • {transactionId}
                            </span>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                Đang đồng bộ kết quả thanh toán từ VNPAY...
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                                Hệ thống đang xác nhận tín hiệu IPN từ ngân hàng phát hành cho đơn hàng{" "}
                                <strong className="text-slate-900 dark:text-white tabular-nums">{normalizedOrderId}</strong>. Quá trình này thường mất từ 5 - 15 giây.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 text-left space-y-2 text-xs text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>Hướng dẫn kiểm tra xác nhận tự động:</span>
                            </div>
                            <p>
                                • Ngay khi đối soát hoàn tất, biên lai điện tử và mã vận đơn GHN Express sẽ được gửi tới hộp thư <strong>quan.nguyen@shopviet.vn</strong> và tin nhắn Zalo OA.
                            </p>
                            <p className="flex items-center gap-1.5">
                                <PhoneCall className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>Hotline hỗ trợ đối soát thanh toán 24/7: <strong>1800 6868</strong></span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button
                                onClick={() => setStatus("success")}
                                className="rounded-xl bg-primary text-white hover:bg-primary/90 h-11 px-6 text-xs font-bold cursor-pointer"
                            >
                                Kiểm tra lại trạng thái ngay
                            </Button>
                            <Button
                                onClick={() => router.push("/account/orders")}
                                variant="outline"
                                className="rounded-xl border-slate-300 dark:border-slate-700 h-11 px-6 text-xs font-bold cursor-pointer"
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
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                </div>
            }
        >
            <VnPayReturnContent />
        </Suspense>
    )
}
