"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import returnService from "@/services/return-service"
import { ReturnRequest, getReturnStatusName, getReturnStatusColor } from "@/types/return-request"
import { ArrowLeft, Clock, Package, MessageSquare, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react"

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
            <div className="glass-card rounded-3xl p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-64 bg-secondary/50 rounded-lg" />
                    <div className="h-48 bg-secondary/50 rounded-xl" />
                </div>
            </div>
        )
    }

    if (!returnRequest) {
        return (
            <div className="glass-card rounded-3xl p-8 text-center">
                <p className="text-muted-foreground">Không tìm thấy yêu cầu đổi/trả.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card rounded-3xl p-8">
                <button
                    onClick={() => router.push("/account/returns")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tech-heading">{returnRequest.code}</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Đơn hàng: {returnRequest.orderCode}
                        </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getReturnStatusColor(returnRequest.status)}`}>
                        {getReturnStatusName(returnRequest.status)}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-3xl p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Thông tin yêu cầu
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Loại</span>
                            <span className="font-medium">{returnRequest.typeDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Lý do</span>
                            <span>{returnRequest.reasonDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số lượng</span>
                            <span className="font-medium">{returnRequest.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số tiền</span>
                            <span className="font-semibold text-primary">{formatCurrency(returnRequest.refundAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày tạo</span>
                            <span>{new Date(returnRequest.createdAt).toLocaleString("vi-VN")}</span>
                        </div>
                        {returnRequest.resolvedAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày xử lý</span>
                                <span>{new Date(returnRequest.resolvedAt).toLocaleString("vi-VN")}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Ghi chú
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Ghi chú của bạn</p>
                            <p className="text-sm bg-secondary/30 rounded-xl p-3">{returnRequest.customerNote || "Không có"}</p>
                        </div>
                        {returnRequest.staffNote && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Phản hồi nhân viên</p>
                                <p className="text-sm bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">{returnRequest.staffNote}</p>
                            </div>
                        )}
                        {returnRequest.rejectionReason && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Lý do từ chối</p>
                                <p className="text-sm bg-red-50 dark:bg-red-950/30 rounded-xl p-3">{returnRequest.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Evidence */}
            {returnRequest.evidences.length > 0 && (
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        Bằng chứng ({returnRequest.evidences.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {returnRequest.evidences.map((e) => (
                            <div key={e.id} className="aspect-square rounded-2xl overflow-hidden border bg-secondary/30">
                                {e.fileType === 0 ? (
                                    <img src={e.fileUrl} alt={e.description || ""} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
                <div className="glass-card rounded-3xl p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-primary" />
                        Tiến trình xử lý
                    </h3>
                    <div className="relative pl-6 space-y-6">
                        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/60 to-secondary/30 rounded-full" />
                        {returnRequest.statusHistory.map((h, idx) => (
                            <div key={idx} className="relative flex items-start gap-4">
                                <div className={`absolute -left-6 mt-1 h-6 w-6 rounded-full flex items-center justify-center ${idx === 0 ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                                    }`}>
                                    {idx === 0 ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-current" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-sm">{getReturnStatusName(h.status)}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(h.changedAt).toLocaleString("vi-VN")}
                                        </span>
                                    </div>
                                    {h.note && <p className="text-sm text-muted-foreground mt-0.5">{h.note}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
