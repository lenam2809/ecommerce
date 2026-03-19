"use client"

import { StatusBadge } from "./status-badge"
import { formatDate, formatPrice } from "@/lib/contants"
import { Order } from "@/types/order"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Package, Calendar, Truck } from "lucide-react"

export function OrderItem({ order }: { order: Order }) {
    return (
        <div className="glass-card bg-card/40 border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:border-border/80 transition-all duration-300 group">
            <div className="p-4 sm:p-5 bg-secondary/30 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground text-sm uppercase tracking-wider">Mã đơn: #{order.code}</span>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-background/50 px-2.5 py-1.5 rounded-md border border-border/30 w-fit">
                            <Calendar className="h-3.5 w-3.5" />
                            Ngày đặt: <span className="font-medium text-foreground">{formatDate(order.orderDate)}</span>
                        </div>
                        {order.expectedDeliveryDate && (
                            <div className="text-xs text-primary flex items-center gap-1.5 bg-primary/5 px-2.5 py-1.5 rounded-md border border-primary/10 w-fit">
                                <Truck className="h-3.5 w-3.5" />
                                Dự kiến giao: <span className="font-medium">{formatDate(order.expectedDeliveryDate)}</span>
                            </div>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl border-border/60 hover:bg-secondary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 w-full sm:w-auto">
                    <Link href={`/account/orders/${order.id}`} className="flex items-center justify-center">
                        <span className="mr-1">Xem chi tiết</span> <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="p-4 sm:p-5">
                <div className="space-y-4">
                    {order.orderItems.slice(0, 2).map((item) => (
                        <div key={`${item.productId}-${item.color}-${item.size}`} className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-secondary/40 rounded-xl overflow-hidden border border-border/40 shrink-0">
                                {item.image || (item as any).imageUrl ? (
                                    <img
                                        src={item.image || (item as any).imageUrl}
                                        alt={item.name || (item as any).productName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <Package className="h-6 w-6 opacity-30" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <h4 className="text-sm font-semibold line-clamp-2 text-foreground mb-1.5 leading-snug">
                                    {item.name || (item as any).productName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    {item.color && <span className="inline-flex items-center bg-secondary/70 px-2 py-0.5 rounded-md text-foreground/80 font-medium">Màu: {item.color}</span>}
                                    {item.size && <span className="inline-flex items-center bg-secondary/70 px-2 py-0.5 rounded-md text-foreground/80 font-medium">Size: {item.size}</span>}
                                    <span className="inline-flex items-center text-foreground font-medium bg-secondary/30 px-2 py-0.5 rounded-md">SL: {item.quantity}</span>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-foreground whitespace-nowrap pt-0.5">
                                {formatPrice(item.unitPrice * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>

                {order.orderItems.length > 2 && (
                    <div className="mt-4 text-sm text-primary font-medium pl-20 flex items-center gap-1.5">
                        <div className="h-px bg-primary/20 flex-1 w-8 max-w-8"></div>
                        <span>+ {order.orderItems.length - 2} sản phẩm khác</span>
                    </div>
                )}

                <div className="mt-5 pt-4 border-t border-border/50 flex justify-between items-center bg-secondary/10 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5">
                    <div className="text-sm font-medium text-muted-foreground">{order.orderItems.length} sản phẩm</div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-1">Tổng cộng:</span>
                        <span className="font-bold text-lg text-primary drop-shadow-sm">
                            {formatPrice(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}