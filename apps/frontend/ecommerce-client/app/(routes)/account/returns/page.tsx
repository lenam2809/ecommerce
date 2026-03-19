"use client"

import { useEffect, useState } from "react"
import returnService from "@/services/return-service"
import { ReturnRequestList, getReturnStatusName, getReturnStatusColor } from "@/types/return-request"
import Link from "next/link"
import { ChevronRight, RotateCcw, Clock } from "lucide-react"

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
            <div className="glass-card rounded-3xl p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-secondary/50 rounded-lg" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-secondary/50 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8 border-border/50 min-h-[500px]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tech-heading flex items-center pl-2 border-l-4 border-primary/50">Đổi/Trả hàng</h2>
                        <p className="text-muted-foreground text-sm mt-2 ml-3">Quản lý các yêu cầu đổi trả hàng của bạn</p>
                    </div>
                </div>

                {returns.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center">
                         <div className="h-24 w-24 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                            <RotateCcw className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 tech-heading">Chưa có yêu cầu nào</h3>
                        <p className="text-muted-foreground">Bạn chưa có yêu cầu đổi/trả nào.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {returns.map((item) => (
                            <Link
                                key={item.id}
                                href={`/account/returns/${item.id}`}
                                className="block glass-card bg-card/40 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-border/80 transition-all duration-300 group border border-border/50"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-foreground text-sm uppercase tracking-wider">Mã: #{item.code}</span>
                                            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${getReturnStatusColor(item.status)}`}>
                                                {getReturnStatusName(item.status)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-md border border-border/30">Đơn: <span className="font-semibold ml-1 text-foreground">{item.orderCode}</span></div>
                                            <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-md border border-border/30 text-primary font-medium">{item.typeDisplay}</div>
                                            <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-md border border-border/30 font-medium">SL: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                        <p className="font-bold text-lg text-primary drop-shadow-sm">{formatCurrency(item.refundAmount)}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0 sm:mt-1.5 bg-background/50 px-2 py-1 rounded-md">
                                            <Clock className="h-3 w-3" />
                                            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                        </div>
                                    </div>
                                    <ChevronRight className="hidden sm:block h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors ml-2" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
