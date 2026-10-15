"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import returnService from "@/services/return-service"
import { ReturnRequest, getReturnStatusName, getReturnStatusColor } from "@/types/return-request"
import { ArrowLeft, Clock, Package, MessageSquare, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

/**
 * ReturnDetailPage — Editorial Minimal
 */
export default function ReturnDetailPage() {
    const params = useParams()
    const router = useRouter()
    const returnId = params.returnId as string
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const result = await returnService.getReturnById(returnId)
                if (result.success && result.data) {
                    setReturnRequest(result.data)
                }
            } catch {
                // Handled by service
            } finally {
                setLoading(false)
            }
        }
        if (returnId) fetchDetail()
    }, [returnId])

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px] rounded-2xl border border-line bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        )
    }

    if (!returnRequest) {
        return (
            <div className="rounded-2xl border border-line bg-card p-8 text-center">
                <p className="text-ink-soft">Không tìm thấy yêu cầu đổi/trả.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-line bg-card p-6 md:p-8">
                <button
                    onClick={() => router.push("/account/returns")}
                    className="flex items-center gap-2 text-small text-ink-soft hover:text-brand transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </button>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-h1 font-semibold tracking-tight text-ink">{returnRequest.code}</h1>
                        <p className="text-ink-soft text-small mt-1">
                            Đơn hàng: {returnRequest.orderCode}
                        </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-small font-medium border ${getReturnStatusColor(returnRequest.status)}`}>
                        {getReturnStatusName(returnRequest.status)}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-line bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-ink flex items-center gap-2">
                        <Package className="h-5 w-5 text-brand" />
                        Thông tin yêu cầu
                    </h3>
                    <dl className="space-y-3 text-small">
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-faint">Loại</dt>
                            <dd className="font-medium text-ink text-right">{returnRequest.typeDisplay}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-faint">Lý do</dt>
                            <dd className="text-ink text-right">{returnRequest.reasonDisplay}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-faint">Số lượng</dt>
                            <dd className="font-medium text-ink">{returnRequest.quantity}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-faint">Số tiền</dt>
                            <dd className="font-semibold text-brand">{formatCurrency(returnRequest.refundAmount)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-faint">Ngày tạo</dt>
                            <dd className="text-ink">{new Date(returnRequest.createdAt).toLocaleString("vi-VN")}</dd>
                        </div>
                        {returnRequest.resolvedAt && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-ink-faint">Ngày xử lý</dt>
                                <dd className="text-ink">{new Date(returnRequest.resolvedAt).toLocaleString("vi-VN")}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="rounded-2xl border border-line bg-card p-6 space-y-4">
                    <h3 className="font-semibold text-ink flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-brand" />
                        Ghi chú
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-tiny text-ink-faint mb-1">Ghi chú của bạn</p>
                            <p className="text-small bg-surface rounded-xl p-3 border border-line text-ink">{returnRequest.customerNote || "Không có"}</p>
                        </div>
                        {returnRequest.staffNote && (
                            <div>
                                <p className="text-tiny text-ink-faint mb-1">Phản hồi nhân viên</p>
                                <p className="text-small bg-brand-soft/50 rounded-xl p-3 border border-brand/10 text-ink">{returnRequest.staffNote}</p>
                            </div>
                        )}
                        {returnRequest.rejectionReason && (
                            <div>
                                <p className="text-tiny text-ink-faint mb-1">Lý do từ chối</p>
                                <p className="text-small bg-destructive/5 rounded-xl p-3 border border-destructive/20 text-ink">{returnRequest.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Evidence */}
            {returnRequest.evidences.length > 0 && (
                <div className="rounded-2xl border border-line bg-card p-6">
                    <h3 className="font-semibold text-ink flex items-center gap-2 mb-4">
                        <ImageIcon className="h-5 w-5 text-brand" />
                        Bằng chứng ({returnRequest.evidences.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {returnRequest.evidences.map((e) => (
                            <div key={e.id} className="relative aspect-square rounded-2xl overflow-hidden border border-line bg-surface">
                                {e.fileType === 0 ? (
                                    <Image
                                        src={e.fileUrl || "/placeholder.svg"}
                                        alt={e.description || "Evidence"}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-ink-faint">
                                        Video
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            {returnRequest.statusHistory.length > 0 && (
                <div className="rounded-2xl border border-line bg-card p-6">
                    <h3 className="font-semibold text-ink flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-brand" />
                        Tiến trình xử lý
                    </h3>
                    <div className="relative pl-6 space-y-6">
                        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-line rounded-full" />
                        {returnRequest.statusHistory.map((h, idx) => (
                            <div key={idx} className="relative flex items-start gap-4">
                                <div className={`absolute -left-6 mt-1 h-6 w-6 rounded-full flex items-center justify-center ${idx === 0 ? "bg-brand text-white" : "bg-surface text-ink-faint border border-line"
                                    }`}>
                                    {idx === 0 ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-current" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-small text-ink">{getReturnStatusName(h.status)}</span>
                                        <span className="text-tiny text-ink-faint">
                                            {new Date(h.changedAt).toLocaleString("vi-VN")}
                                        </span>
                                    </div>
                                    {h.note && <p className="text-small text-ink-soft mt-0.5">{h.note}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
