"use client"

import { useEffect, useState } from "react"
import returnService from "@/services/return-service"
import { ReturnRequestList, getReturnStatusName, getReturnStatusColor } from "@/types/return-request"
import Link from "next/link"
import { ChevronRight, RotateCcw, Clock } from "lucide-react"

/**
 * MyReturnsPage — Editorial Minimal
 */
export default function MyReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequestList[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const result = await returnService.getMyReturns()
                if (result.success && result.data) {
                    setReturns(result.data)
                }
            } catch {
                // Handled by service
            } finally {
                setLoading(false)
            }
        }
        fetchReturns()
    }, [])

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    if (loading) {
        return (
            <div className="rounded-2xl border border-line bg-card p-6 md:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-muted rounded-lg" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-card p-6 md:p-8 min-h-[500px]">
                <div className="section-heading !mb-6">
                    <p className="section-label">Đổi/Trả hàng</p>
                    <h2 className="section-title">Yêu cầu đổi/trả của bạn</h2>
                    <p className="text-small text-ink-soft mt-1">Quản lý các yêu cầu đổi trả hàng của bạn</p>
                </div>

                {returns.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-surface flex items-center justify-center mb-6">
                            <RotateCcw className="h-10 w-10 text-ink-faint" />
                        </div>
                        <h3 className="text-h3 font-semibold text-ink mb-2">Chưa có yêu cầu nào</h3>
                        <p className="text-ink-soft">Bạn chưa có yêu cầu đổi/trả nào.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {returns.map((item) => (
                            <Link
                                key={item.id}
                                href={`/account/returns/${item.id}`}
                                className="block bg-card rounded-2xl p-5 hover:border-ink/30 transition-colors group border border-line"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-ink text-small uppercase tracking-wider">Mã: #{item.code}</span>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-tiny font-medium border ${getReturnStatusColor(item.status)}`}>
                                                {getReturnStatusName(item.status)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-tiny text-ink-soft">
                                            <div className="flex items-center bg-surface px-2 py-1 rounded-md border border-line">Đơn: <span className="font-semibold ml-1 text-ink">{item.orderCode}</span></div>
                                            <div className="flex items-center bg-surface px-2 py-1 rounded-md border border-line text-brand font-medium">{item.typeDisplay}</div>
                                            <div className="flex items-center bg-surface px-2 py-1 rounded-md border border-line font-medium text-ink">SL: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                        <p className="font-bold text-h3 text-ink tracking-tight">{formatCurrency(item.refundAmount)}</p>
                                        <div className="flex items-center gap-1.5 text-tiny text-ink-faint bg-surface px-2 py-1 rounded-md">
                                            <Clock className="h-3 w-3" />
                                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                        </div>
                                    </div>
                                    <ChevronRight className="hidden sm:block h-5 w-5 text-ink-faint group-hover:text-brand transition-colors ml-2" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
