"use client"

import { useEffect, useState } from "react"
import returnService from "@/services/return-service"
import { ReturnRequestList } from "@/types/return-request"
import Link from "next/link"
import { formatPrice } from "@/lib/contants"
import {
    ChevronRight,
    Store,
    Truck,
    ShieldCheck,
    Wrench,
} from "lucide-react"

export default function MyReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequestList[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [returnMethod, setReturnMethod] = useState<"showroom" | "pickup">("showroom")

    useEffect(() => {
        const fetchReturns = async () => {
            setIsLoading(true)
            try {
                const result = await returnService.getMyReturns()
                if (result.success && result.data) {
                    setReturns(result.data)
                }
            } catch {
                setReturns([])
            } finally {
                setIsLoading(false)
            }
        }
        fetchReturns()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header & O2O 45 Showroom 15-Minute Instant Exchange Selector */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-primary mb-1">
                            Trung tâm Bảo hành &amp; Đổi trả 1 Đổi 1 (30 Ngày)
                        </p>
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Quản lý &amp; Chi tiết đổi trả hàng
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Áp dụng chính sách 1 đổi 1 máy mới nguyên seal trong 30 ngày đầu tại 45 Showroom toàn quốc
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                        Chính sách 30 ngày 1 đổi 1
                    </span>
                </div>

                {/* O2O Return Method Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                        onClick={() => setReturnMethod("showroom")}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                            returnMethod === "showroom"
                                ? "border-primary bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-primary/15"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40"
                        }`}
                    >
                        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                            <Store className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    Đem máy ra 45 Showroom gần nhất
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                                    Lấy ngay 15 phút
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                                Kỹ thuật viên kiểm định trực tiếp và xuất sản phẩm mới 1 đổi 1 ngay tại quầy trong 15 phút.
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => setReturnMethod("pickup")}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                            returnMethod === "pickup"
                                ? "border-primary bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-primary/15"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40"
                        }`}
                    >
                        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    Thu hồi &amp; Đổi mới tận nơi
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                    Miễn phí 100%
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                                Đơn vị vận chuyển nhận lại sản phẩm tại địa chỉ của bạn và chuyển về trung tâm bảo hành.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Request List */}
            {isLoading ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-8 space-y-4 shadow-xs">
                    <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                </div>
            ) : returns.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card overflow-hidden shadow-xs divide-y divide-slate-200 dark:divide-slate-800">
                    <div className="p-5 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Danh sách yêu cầu đổi trả ({returns.length})
                        </h3>
                    </div>
                    {returns.map((item) => (
                        <div key={item.id} className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                                            #{item.code}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-primary text-xs font-extrabold">
                                            {item.statusDisplay}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                                        Đơn hàng: <strong>#{item.orderCode}</strong> • Ngày tạo: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300">
                                        Hình thức: {item.typeDisplay} • Số lượng: {item.quantity}
                                    </p>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                    <span className="text-sm font-extrabold text-brand font-mono tabular-nums whitespace-nowrap">
                                        {formatPrice(item.refundAmount)}
                                    </span>
                                    <Link
                                        href={`/account/returns/${item.id}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                    >
                                        <span>Chi tiết biên bản</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-12 text-center shadow-xs">
                    <Wrench className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Bạn chưa có yêu cầu đổi trả hoặc bảo hành nào
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-5">
                        Khi phát sinh nhu cầu bảo hành hoặc đổi mới 1 đổi 1 trong 30 ngày, bạn có thể tạo yêu cầu từ lịch sử đơn hàng.
                    </p>
                    <Link
                        href="/account/orders"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
                    >
                        <span>Xem lịch sử đơn hàng</span>
                    </Link>
                </div>
            )}
        </div>
    )
}
