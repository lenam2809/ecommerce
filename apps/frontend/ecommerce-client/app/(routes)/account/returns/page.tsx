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
    CheckCircle2,
    Wrench,
    MessageSquare,
} from "lucide-react"

export default function MyReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequestList[]>([])
    const [returnMethod, setReturnMethod] = useState<"showroom" | "pickup">("showroom")

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const result = await returnService.getMyReturns()
                if (result.success && result.data) {
                    setReturns(result.data)
                }
            } catch {
                // Fallback to SSoT 2026 RMA data when offline
            }
        }
        fetchReturns()
    }, [])

    const fiveSteps = [
        {
            step: 1,
            title: "1. Gửi yêu cầu RMA",
            desc: "19/10/2026 • 15:10",
            done: true,
        },
        {
            step: 2,
            title: "2. Tiếp nhận & Kiểm định",
            desc: "19/10/2026 • 15:20",
            done: true,
        },
        {
            step: 3,
            title: "3. Xác nhận lỗi NSX",
            desc: "Đang đo dòng PD 100W",
            active: true,
        },
        {
            step: 4,
            title: "4. Xuất mới 1 đổi 1",
            desc: "Chờ xuất kho Q.1",
            done: false,
        },
        {
            step: 5,
            title: "5. Hoàn tất bàn giao",
            desc: "Dự kiến trong 15 phút",
            done: false,
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header & O2O 45 Showroom 15-Minute Instant Exchange Selector */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs space-y-5">
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
                        Ưu tiên VIP Diamond
                    </span>
                </div>

                {/* O2O Return Method Selector: 45 Showrooms (15 mins) vs Home Pickup */}
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
                                Kỹ thuật viên kiểm định trực tiếp và xuất sản phẩm mới 1 đổi 1 ngay tại quầy VIP trong 15 phút.
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
                                    Thu hồi &amp; Đổi mới tận nơi (GHN Express)
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                    Miễn phí 100%
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                                Shipper nhận lại sản phẩm tại địa chỉ của bạn và giao sản phẩm thay thế trong vòng 2 - 4 giờ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Return Request Detail Card (#RMA-20261019-104 — SSoT D3-05) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                                Hồ sơ đổi trả: #RMA-20261019-104
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-primary text-xs font-extrabold">
                                Đang kiểm tra kỹ thuật (Bước 3/5)
                            </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
                            Thuộc đơn hàng: <strong>#ORD-20261019-8892</strong> • Ngày tạo: <strong>19/10/2026 • 15:10</strong>
                        </p>
                    </div>
                    <Link
                        href="/account/returns/RMA-20261019-104"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                        <span>Xem trang biên bản đầy đủ</span>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="p-6 space-y-6">
                    {/* 5-Step Return Progress Stepper */}
                    <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                            Tiến trình xử lý 5 bước chuẩn Apple Authorized Service
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                            {fiveSteps.map((s) => (
                                <div
                                    key={s.step}
                                    className={`rounded-xl p-3 border ${
                                        s.done
                                            ? "border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/60 dark:bg-emerald-950/30"
                                            : s.active
                                            ? "border-primary bg-blue-50/70 dark:bg-blue-950/30 ring-2 ring-primary/15"
                                            : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 opacity-80"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                            {s.title}
                                        </span>
                                        {s.done && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                        {s.active && (
                                            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                                        {s.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* High-Contrast Reason & Technician Log Cards (strictly text-slate-800 / WCAG AA+) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/50 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary">
                                <MessageSquare className="h-4 w-4" />
                                <span>Mô tả lý do đổi mới từ khách hàng</span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Sản phẩm: Cáp sạc nhanh Ugreen Type-C to Type-C 100W PD 3.0 2m (SN: UG20261019-A02)
                            </p>
                            <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed bg-white dark:bg-[#111827] p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                &ldquo;Sợi cáp thứ 2 (SN: UG20261019-A02) chỉ nhận công suất sạc 60W thay vì 100W khi cắm vào MacBook Pro 14 M3 Pro. Yêu cầu đổi mới 1 đổi 1 tại Showroom Quận 1.&rdquo;
                            </p>
                        </div>

                        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 p-4 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary">
                                    <Wrench className="h-4 w-4" />
                                    <span>Nhật ký kỹ thuật viên ShopViet Care</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                    19/10/2026 • 15:25
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Kỹ thuật viên trưởng: Trần Quốc Bảo (Showroom Flagship Q.1)
                            </p>
                            <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed bg-white dark:bg-[#111827] p-3 rounded-lg border border-blue-200/80 dark:border-slate-800">
                                &ldquo;Đã đo kiểm bằng máy Power-Z KM003C: Chip E-Marker trên sợi SN UG20261019-A02 báo dòng tối đa 3A (60W). Đủ điều kiện lỗi nhà sản xuất — Đã duyệt xuất mới 1 đổi 1 sợi Ugreen 100W 5A nguyên hộp.&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Additional API returns if present */}
                    {returns.length > 0 && (
                        <div className="space-y-3 pt-2">
                            {returns.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/account/returns/${item.id}`}
                                    className="block bg-white dark:bg-[#111827] rounded-xl p-4 hover:border-primary transition-colors border border-slate-200 dark:border-slate-800"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                                                Mã: #{item.code}
                                            </span>
                                            <span className="ml-3 text-xs text-slate-700 dark:text-slate-300">
                                                Đơn: {item.orderCode}
                                            </span>
                                        </div>
                                        <span className="font-extrabold text-sm text-primary tabular-nums whitespace-nowrap">
                                            {formatPrice(item.refundAmount)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
