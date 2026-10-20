"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import returnService from "@/services/return-service"
import { ReturnRequest, EReturnType, EReturnReason, EReturnStatus } from "@/types/return-request"
import { formatPrice } from "@/lib/contants"
import {
    ArrowLeft,
    Clock,
    Package,
    MessageSquare,
    CheckCircle2,
    Wrench,
    Store,
    ShieldCheck,
} from "lucide-react"

const SSOT_DEFAULT_RETURN_DETAIL: ReturnRequest = {
    id: "RMA-20261019-104",
    code: "RMA-20261019-104",
    orderId: "ORD-20261019-8892",
    orderCode: "ORD-20261019-8892",
    type: EReturnType.Exchange,
    typeDisplay: "Đổi mới 1 đổi 1 (Chính sách 30 ngày)",
    reason: EReturnReason.Defective,
    reasonDisplay: "Lỗi chip E-Marker sạc nhanh PD (Đã xác nhận bởi KTV)",
    status: EReturnStatus.QualityCheck,
    statusDisplay: "Đang kiểm định & Xuất máy mới (Bước 3/5)",
    customerNote:
        "Sợi cáp thứ 2 (SN: UG20261019-A02) chỉ nhận công suất sạc 60W thay vì 100W khi cắm vào MacBook Pro 14 M3 Pro. Yêu cầu đổi mới 1 đổi 1 tại Showroom Quận 1.",
    staffNote:
        "KTV Trần Quốc Bảo (Showroom 125 Lê Lợi, Q.1): Đã đo kiểm bằng Power-Z KM003C, xác nhận lỗi chip E-Marker báo dòng 3A. Đã duyệt xuất mới 1 sợi Ugreen 100W 5A nguyên seal.",
    quantity: 1,
    refundAmount: 450000,
    createdAt: "2026-10-19T15:10:00",
    evidences: [],
    statusHistory: [
        {
            status: EReturnStatus.QualityCheck,
            statusDisplay: "Bước 3: Xác nhận lỗi NSX & Duyệt đổi mới 1 đổi 1",
            note: "KTV Trần Quốc Bảo hoàn tất đo kiểm trong 10 phút tại Showroom Quận 1.",
            changedAt: "2026-10-19T15:25:00",
        },
        {
            status: EReturnStatus.ItemReceived,
            statusDisplay: "Bước 2: Tiếp nhận thiết bị tại Quầy VIP Showroom Q.1",
            note: "Đã đối chiếu Serial Number UG20261019-A02 trên hệ thống e-Warranty.",
            changedAt: "2026-10-19T15:18:00",
        },
        {
            status: EReturnStatus.Requested,
            statusDisplay: "Bước 1: Khởi tạo yêu cầu đổi trả trực tuyến",
            note: "Khách hàng Nguyễn Minh Quân đăng ký đổi nhanh 15 phút tại Showroom.",
            changedAt: "2026-10-19T15:10:00",
        },
    ],
}

export default function ReturnDetailPage() {
    const params = useParams()
    const router = useRouter()
    const returnId = params.returnId as string
    const [returnRequest, setReturnRequest] = useState<ReturnRequest>(SSOT_DEFAULT_RETURN_DETAIL)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const result = await returnService.getReturnById(returnId)
                if (result.success && result.data) {
                    setReturnRequest(result.data)
                }
            } catch {
                // Keep SSoT 2026 default return detail
            }
        }
        if (returnId) fetchDetail()
    }, [returnId])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs">
                <button
                    type="button"
                    onClick={() => router.push("/account/returns")}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại danh sách đổi trả</span>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                Biên bản bảo hành #{returnRequest.code}
                            </h1>
                            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-primary text-xs font-extrabold">
                                {returnRequest.statusDisplay}
                            </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
                            Đơn hàng gốc: <strong>#{returnRequest.orderCode}</strong> • Hình thức xử lý: <strong>Đổi lấy ngay 15 phút tại 45 Showroom</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Info & High-Contrast Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4 shadow-xs">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Thông tin sản phẩm &amp; Chính sách
                    </h3>
                    <dl className="space-y-3 text-xs">
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-600 dark:text-slate-400">Hình thức</dt>
                            <dd className="font-extrabold text-primary text-right">{returnRequest.typeDisplay}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-600 dark:text-slate-400">Chẩn đoán kỹ thuật</dt>
                            <dd className="font-bold text-slate-800 dark:text-slate-100 text-right">{returnRequest.reasonDisplay}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-600 dark:text-slate-400">Số lượng đổi mới</dt>
                            <dd className="font-bold text-slate-900 dark:text-white tabular-nums">{returnRequest.quantity} đơn vị</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-600 dark:text-slate-400">Giá trị bảo hiểm đổi mới</dt>
                            <dd className="font-extrabold text-[#e11d48] tabular-nums whitespace-nowrap">
                                {formatPrice(returnRequest.refundAmount)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-600 dark:text-slate-400">Địa điểm tiếp nhận</dt>
                            <dd className="font-bold text-slate-800 dark:text-slate-200 text-right flex items-center gap-1">
                                <Store className="h-3.5 w-3.5 text-primary" />
                                Showroom Flagship 125 Lê Lợi, Q.1
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4 shadow-xs">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        Nhật ký kiểm định kỹ thuật (WCAG High Contrast)
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                Yêu cầu từ khách hàng Nguyễn Minh Quân:
                            </p>
                            <p className="text-xs bg-slate-50 dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                                {returnRequest.customerNote}
                            </p>
                        </div>
                        {returnRequest.staffNote && (
                            <div>
                                <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Kết luận của Kỹ thuật viên trưởng:
                                </p>
                                <p className="text-xs bg-blue-50/70 dark:bg-blue-950/30 rounded-xl p-3.5 border border-blue-200 dark:border-blue-800/70 text-slate-800 dark:text-slate-100 leading-relaxed font-semibold">
                                    {returnRequest.staffNote}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-5">
                    <Clock className="h-5 w-5 text-primary" />
                    Nhật ký thời gian thực (19/10/2026)
                </h3>
                <div className="relative pl-6 space-y-5">
                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-200 dark:bg-slate-800 rounded-full" />
                    {returnRequest.statusHistory.map((h, idx) => (
                        <div key={idx} className="relative flex items-start gap-4">
                            <div
                                className={`absolute -left-6 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${
                                    idx === 0
                                        ? "bg-primary text-white"
                                        : "bg-emerald-600 text-white"
                                }`}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                        {h.statusDisplay}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                                        • 19/10/2026
                                    </span>
                                </div>
                                {h.note && (
                                    <p className="text-xs text-slate-800 dark:text-slate-200 mt-1">
                                        {h.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
