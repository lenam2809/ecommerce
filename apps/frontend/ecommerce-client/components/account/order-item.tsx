"use client"

import { StatusBadge } from "./status-badge"
import { formatDate, formatPrice } from "@/lib/contants"
import { Order } from "@/types/order"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Package, Calendar, Truck } from "lucide-react"

import Image from "next/image"

/**
 * OrderItem — Editorial Minimal
 */
export function OrderItem({ order }: { order: Order }) {
    return (
        <div className="bg-card border border-line rounded-2xl overflow-hidden transition-colors duration-200 hover:border-ink/30 group">
            <div className="p-4 sm:p-5 bg-surface border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-ink text-small uppercase tracking-wider">Mã đơn: #{order.code}</span>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                        <div className="text-tiny text-ink-soft flex items-center gap-1.5 bg-background px-2.5 py-1.5 rounded-md border border-line w-fit">
                            <Calendar className="h-3.5 w-3.5" />
                            Ngày đặt: <span className="font-medium text-ink">{formatDate(order.orderDate)}</span>
                        </div>
                        {order.expectedDeliveryDate && (
                            <div className="text-tiny text-brand flex items-center gap-1.5 bg-brand-soft px-2.5 py-1.5 rounded-md border border-brand/10 w-fit">
                                <Truck className="h-3.5 w-3.5" />
                                Dự kiến giao: <span className="font-medium">{formatDate(order.expectedDeliveryDate)}</span>
                            </div>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-full border-line hover:bg-surface text-ink transition-colors w-full sm:w-auto">
                    <Link href={`/account/orders/${order.id}`} className="flex items-center justify-center">
                        <span className="mr-1">Xem chi tiết</span> <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="p-4 sm:p-5">
                <div className="space-y-4">
                    {order.orderItems.slice(0, 2).map((item) => (
                        <div key={`${item.productId}-${item.color}-${item.size}`} className="flex items-start gap-4">
                            <div className="relative w-16 h-16 bg-surface rounded-xl overflow-hidden border border-line shrink-0">
                                {item.image || item.imageUrl ? (
                                    <Image
                                        src={item.image || item.imageUrl || "/placeholder.svg"}
                                        alt={item.name || item.productName || "Product"}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-ink-faint">
                                        <Package className="h-6 w-6 opacity-30" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <h4 className="text-small font-semibold line-clamp-2 text-ink mb-1.5 leading-snug">
                                    {item.name || item.productName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-tiny text-ink-soft">
                                    {item.color && <span className="inline-flex items-center bg-surface px-2 py-0.5 rounded-md text-ink font-medium">Màu: {item.color}</span>}
                                    {item.size && <span className="inline-flex items-center bg-surface px-2 py-0.5 rounded-md text-ink font-medium">Size: {item.size}</span>}
                                    <span className="inline-flex items-center text-ink font-medium bg-surface px-2 py-0.5 rounded-md">SL: {item.quantity}</span>
                                </div>
                            </div>
                            <div className="text-small font-bold text-ink whitespace-nowrap pt-0.5">
                                {formatPrice(item.unitPrice * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>

                {order.orderItems.length > 2 && (
                    <div className="mt-4 text-small text-brand font-medium pl-20 flex items-center gap-1.5">
                        <div className="h-px bg-brand/20 flex-1 w-8 max-w-8"></div>
                        <span>+ {order.orderItems.length - 2} sản phẩm khác</span>
                    </div>
                )}

                <div className="mt-5 pt-4 border-t border-line flex justify-between items-center bg-surface -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5">
                    <div className="text-small font-medium text-ink-soft">{order.orderItems.length} sản phẩm</div>
                    <div className="flex items-center gap-2">
                        <span className="text-small text-ink-soft mr-1">Tổng cộng:</span>
                        <span className="font-bold text-h3 text-ink tracking-tight">
                            {formatPrice(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
