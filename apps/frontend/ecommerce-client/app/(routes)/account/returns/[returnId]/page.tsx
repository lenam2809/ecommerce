"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import returnService from "@/services/return-service"
import { ReturnRequest, ReturnTimelineStep, ReturnRequestLog } from "@/types/return-request"
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
    UserCheck,
    FileCheck,
} from "lucide-react"

export default function ReturnDetailPage() {
    const params = useParams()
    const router = useRouter()
    const returnId = params.returnId as string
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const result = await returnService.getReturnById(returnId)
                if (result.success && result.data) {
                    setReturnRequest(result.data)
                } else {
                    setError(result.message || "Không tìm thấy thông tin yêu cầu đổi trả.")
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Không thể tải thông tin yêu cầu đổi trả."
                setError(message)
            } finally {
                setIsLoading(false)
            }
        }
        if (returnId) fetchDetail()
    }, [returnId])

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-line bg-card p-8 shadow-xs">
                <div className="h-6 w-48 bg-surface rounded-lg animate-pulse mb-4" />
                <div className="h-10 w-96 bg-surface rounded-lg animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-surface rounded-xl animate-pulse" />
                    <div className="h-48 bg-surface rounded-xl animate-pulse" />
                </div>
            </div>
        )
    }

    if (error || !returnRequest) {
        return (
            <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-xs">
                <p className="text-sm font-semibold text-destructive mb-4">
                    {error || "Không tìm thấy thông tin yêu cầu đổi trả."}
                </p>
                <button
                    type="button"
                    onClick={() => router.push("/account/returns")}
                    className="inline-flex items-center gap-2 text-xs font-bold text-tech-blue hover:underline cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại danh sách đổi trả</span>
                </button>
            </div>
        )
    }

    // 5 standard steps
    const timelineSteps: ReturnTimelineStep[] =
        returnRequest.timelineSteps && returnRequest.timelineSteps.length > 0
            ? returnRequest.timelineSteps
            : [
                  {
                      step: 1,
                      title: "Bước 1: Khởi tạo yêu cầu đổi/trả trực tuyến",
                      description: "Khách hàng gửi yêu cầu kèm hình ảnh/video mô tả lỗi.",
                      status: "Completed",
                      completedAt: returnRequest.createdAt,
                  },
                  {
                      step: 2,
                      title: "Bước 2: Tiếp nhận thiết bị & đối chiếu Serial/IMEI",
                      description: returnRequest.showroomName
                          ? `Tiếp nhận tại Quầy VIP ${returnRequest.showroomName}`
                          : "Tiếp nhận thiết bị tại 45 Showroom ShopViet toàn quốc.",
                      status: returnRequest.status >= 1 ? "Completed" : "Active",
                      location: returnRequest.showroomAddress || "Hệ thống 45 Showroom",
                  },
                  {
                      step: 3,
                      title: "Bước 3: KTV kiểm định phần cứng & chẩn đoán lỗi NSX",
                      description: "Kỹ thuật viên đo kiểm bằng máy chuyên dụng, xác thực điều kiện 1 đổi 1.",
                      status: returnRequest.status >= 5 ? "Completed" : returnRequest.status >= 1 ? "Active" : "Pending",
                      actor: returnRequest.assignedTechnicianName || "KTV Trưởng",
                  },
                  {
                      step: 4,
                      title: "Bước 4: Phê duyệt giải pháp & Xuất máy mới",
                      description: "Duyệt xuất máy mới 100% nguyên seal hoặc lệnh hoàn tiền.",
                      status: returnRequest.status >= 6 ? "Completed" : returnRequest.status >= 5 ? "Active" : "Pending",
                  },
                  {
                      step: 5,
                      title: "Bước 5: Bàn giao thiết bị & Cập nhật bảo hành điện tử",
                      description: "Bàn giao máy mới nguyên seal, kích hoạt e-Warranty 24 tháng.",
                      status: returnRequest.status === 8 ? "Completed" : returnRequest.status >= 6 ? "Active" : "Pending",
                      completedAt: returnRequest.resolvedAt,
                  },
              ]

    // Technician logs
    const technicianLogs: ReturnRequestLog[] = returnRequest.logs || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
                <button
                    type="button"
                    onClick={() => router.push("/account/returns")}
                    className="inline-flex items-center gap-2 text-xs font-bold text-ink-soft hover:text-tech-blue transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại danh sách đổi trả</span>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-ink font-mono tabular-nums">
                                Biên bản bảo hành #{returnRequest.code}
                            </h1>
                            <span className="px-3 py-1 rounded-full bg-tech-blue/10 border border-tech-blue/20 text-tech-blue text-xs font-extrabold">
                                {returnRequest.statusDisplay}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft mt-1.5 font-mono tabular-nums">
                            <span>
                                Đơn hàng gốc: <strong className="text-ink">#{returnRequest.orderCode}</strong>
                            </span>
                            {returnRequest.serialNumber && (
                                <span>
                                    • Serial/IMEI: <strong className="text-tech-blue">{returnRequest.serialNumber}</strong>
                                </span>
                            )}
                            {returnRequest.assignedTechnicianName && (
                                <span>
                                    • KTV phụ trách: <strong className="text-ink">{returnRequest.assignedTechnicianName}</strong>
                                </span>
                            )}
                            <span>
                                • Hình thức: <strong className="text-ink">{returnRequest.processingMethod || "Đổi lấy ngay 15 phút tại 45 Showroom"}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5-Step Progress Timeline */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-tech-blue" />
                        <span>Tiến trình giải quyết 5 bước SSoT 2026 (1 đổi 1 trong 15 phút)</span>
                    </h3>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Chính sách 30 ngày 1 đổi 1
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {timelineSteps.map((s) => {
                        const isDone = s.status === "Completed"
                        const isActive = s.status === "Active"
                        return (
                            <div
                                key={s.step}
                                className={`rounded-xl p-3.5 border transition-all ${
                                    isDone
                                        ? "border-emerald-500/40 bg-emerald-500/10 text-ink"
                                        : isActive
                                        ? "border-tech-blue bg-tech-blue/10 ring-2 ring-tech-blue/20 text-ink"
                                        : "border-line bg-surface/50 opacity-60 text-ink-soft"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-tech-blue font-mono tabular-nums">
                                        Bước {s.step}/5
                                    </span>
                                    {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                                    {isActive && (
                                        <span className="h-2 w-2 rounded-full bg-tech-blue animate-ping" />
                                    )}
                                </div>
                                <h4 className="font-bold text-xs leading-snug line-clamp-2 text-ink">
                                    {s.title.replace(/^Bước\s*\d+\s*:\s*/, "")}
                                </h4>
                                <p className="text-[11px] text-ink-soft mt-1 line-clamp-2 leading-relaxed">
                                    {s.description}
                                </p>
                                {(s.actor || s.location || s.completedAt) && (
                                    <div className="mt-2 pt-2 border-t border-line/60 text-[10px] space-y-0.5 text-ink-faint">
                                        {s.actor && <p>👤 {s.actor}</p>}
                                        {s.location && <p>📍 {s.location}</p>}
                                        {s.completedAt && (
                                            <p className="font-mono tabular-nums">
                                                ⏱ {new Date(s.completedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Info & Technician Logs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Product & Warranty Details (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl border border-line bg-card p-6 space-y-4 shadow-xs">
                    <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                        <Package className="h-5 w-5 text-tech-blue" />
                        <span>Thông tin sản phẩm &amp; Chính sách</span>
                    </h3>
                    <dl className="space-y-3 text-xs">
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Hình thức xử lý</dt>
                            <dd className="font-extrabold text-tech-blue text-right">{returnRequest.typeDisplay}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Chẩn đoán kỹ thuật</dt>
                            <dd className="font-bold text-ink text-right">{returnRequest.reasonDisplay}</dd>
                        </div>
                        {returnRequest.serialNumber && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-ink-soft">Số Serial / IMEI</dt>
                                <dd className="font-bold text-tech-blue text-right font-mono tabular-nums">
                                    {returnRequest.serialNumber}
                                </dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Số lượng đổi mới</dt>
                            <dd className="font-bold text-ink tabular-nums">{returnRequest.quantity} máy</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Giá trị bảo hiểm đổi mới</dt>
                            <dd className="font-extrabold text-brand font-mono tabular-nums whitespace-nowrap">
                                {formatPrice(returnRequest.refundAmount)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Địa điểm tiếp nhận</dt>
                            <dd className="font-bold text-ink text-right flex items-center gap-1">
                                <Store className="h-3.5 w-3.5 text-tech-blue shrink-0" />
                                <span className="truncate">
                                    {returnRequest.showroomName || returnRequest.showroomAddress || "45 Showroom ShopViet"}
                                </span>
                            </dd>
                        </div>
                        {returnRequest.assignedTechnicianName && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-ink-soft">Kỹ thuật viên phụ trách</dt>
                                <dd className="font-bold text-ink text-right flex items-center gap-1">
                                    <UserCheck className="h-3.5 w-3.5 text-tech-blue shrink-0" />
                                    <span>{returnRequest.assignedTechnicianName}</span>
                                </dd>
                            </div>
                        )}
                    </dl>

                    <div className="pt-3 border-t border-line space-y-3">
                        <div>
                            <p className="text-xs font-bold text-ink mb-1 flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-tech-blue" />
                                Ghi chú yêu cầu từ khách hàng:
                            </p>
                            <p className="text-xs bg-surface rounded-xl p-3 border border-line text-ink leading-relaxed font-medium">
                                {returnRequest.customerNote || "Không có ghi chú"}
                            </p>
                        </div>
                        {returnRequest.staffNote && (
                            <div>
                                <p className="text-xs font-bold text-tech-blue mb-1 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Kết luận từ Kỹ thuật viên:
                                </p>
                                <p className="text-xs bg-tech-blue/5 rounded-xl p-3 border border-tech-blue/20 text-ink leading-relaxed font-semibold">
                                    {returnRequest.staffNote}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Chronological Technician Inspection Logs (7 cols) */}
                <div className="lg:col-span-7 rounded-2xl border border-line bg-card p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-line">
                        <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-tech-blue" />
                            <span>Nhật ký kỹ thuật viên &amp; Biên bản đo kiểm phần cứng</span>
                        </h3>
                        <span className="text-xs font-mono tabular-nums text-ink-soft">
                            {technicianLogs.length} ghi nhận
                        </span>
                    </div>

                    {technicianLogs.length === 0 ? (
                        <div className="p-8 text-center text-xs text-ink-soft bg-surface rounded-xl border border-line">
                            Đang chờ kỹ thuật viên tiếp nhận và cập nhật biên bản đo kiểm.
                        </div>
                    ) : (
                        <div className="relative pl-6 space-y-4">
                            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-line rounded-full" />
                            {technicianLogs.map((log) => (
                                <div key={log.id} className="relative flex items-start gap-3">
                                    <div className="absolute -left-6 mt-0.5 h-6 w-6 rounded-full bg-tech-blue text-white flex items-center justify-center text-xs font-mono">
                                        <Wrench className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0 bg-surface/60 rounded-xl p-3 border border-line">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <span className="font-extrabold text-xs text-ink">
                                                {log.title}
                                            </span>
                                            <span className="text-[11px] text-ink-soft font-mono tabular-nums">
                                                {new Date(log.loggedAt).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                        {log.note && (
                                            <p className="text-xs text-ink leading-relaxed mt-0.5">
                                                {log.note}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-ink-faint border-t border-line/50 pt-1.5">
                                            {log.actorName && <span>👤 Thực hiện: <strong className="text-ink">{log.actorName}</strong></span>}
                                            {log.location && <span>📍 Địa điểm: <strong className="text-ink">{log.location}</strong></span>}
                                            {log.processingMethod && <span>⚙ Phương thức: <strong className="text-ink">{log.processingMethod}</strong></span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Status History */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
                <h3 className="font-extrabold text-sm text-ink flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-tech-blue" />
                    <span>Lịch sử trạng thái hệ thống</span>
                </h3>
                <div className="relative pl-6 space-y-4">
                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-line rounded-full" />
                    {(returnRequest.statusHistory || []).map((h, idx) => (
                        <div key={idx} className="relative flex items-start gap-4">
                            <div
                                className={`absolute -left-6 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${
                                    idx === 0
                                        ? "bg-tech-blue text-white"
                                        : "bg-emerald-600 text-white"
                                }`}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-xs text-ink">
                                        {h.statusDisplay}
                                    </span>
                                    {h.changedAt && (
                                        <span className="text-xs font-semibold text-ink-soft font-mono tabular-nums">
                                            • {new Date(h.changedAt).toLocaleString("vi-VN")}
                                        </span>
                                    )}
                                </div>
                                {h.note && (
                                    <p className="text-xs text-ink-soft mt-0.5">
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
