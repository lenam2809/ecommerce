"use client"

import { formatDate, formatPrice } from "@/lib/contants"
import { Order } from "@/types/order"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Package } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import { OrderDetailsSkeleton } from "./order-details-skeleton"
import Image from "next/image"

export function OrderDetails({ order, isLoading }: { order: Order | undefined, isLoading: boolean }) {
    if (isLoading || !order) {
        return <OrderDetailsSkeleton />
    }
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/account/orders" className="flex items-center">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại danh sách đơn hàng
                    </Link>
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Đơn hàng #{order.code}</h1>
                            <div className="flex items-center mt-2">
                                <StatusBadge status={order.status} />
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                    Đặt vào {formatDate(order.orderDate)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" disabled={order.status === "Cancelled"}>
                                Hủy đơn hàng
                            </Button>
                            <Button disabled={order.status === "Delivered"}>
                                Mua lại
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold dark:text-white">Sản phẩm</h2>
                            <div className="border dark:border-gray-700 rounded-lg divide-y dark:divide-gray-700">
                                {order.orderItems.map((item) => (
                                    <div key={`${item.productId}-${item.color}-${item.size}`} className="p-4">
                                        <div className="flex gap-4">
                                            <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image || "/placeholder.svg"}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium dark:text-white">{item.name}</h3>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {item.color && <span>Màu: {item.color}</span>}
                                                    {item.size && <span className="ml-2">Size: {item.size}</span>}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Số lượng: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-medium dark:text-white">
                                                {formatPrice(item.unitPrice * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold dark:text-white">Thông tin vận chuyển</h2>
                            <div className="border dark:border-gray-700 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium dark:text-white">Địa chỉ giao hàng</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            {order.shippingAddress}
                                        </p>
                                        {order.deliveryInstructions && (
                                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                                <span className="font-medium">Ghi chú: </span>
                                                {order.deliveryInstructions}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium dark:text-white">Thông tin liên hệ</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            {order.phone}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                            {order.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border dark:border-gray-700 rounded-lg p-4">
                            <h2 className="text-lg font-semibold dark:text-white mb-4">Tóm tắt đơn hàng</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Tạm tính</span>
                                    <span className="dark:text-white">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>

                                {order.discountCode && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Mã giảm giá ({order.discountCode})</span>
                                        <span className="text-green-600 dark:text-green-400">-{formatPrice(0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Phí vận chuyển</span>
                                    <span className="dark:text-white">{formatPrice(0)}</span>
                                </div>

                                <div className="border-t dark:border-gray-700 pt-3 mt-3 flex justify-between">
                                    <span className="font-medium dark:text-white">Tổng cộng</span>
                                    <span className="font-bold text-lg dark:text-white">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border dark:border-gray-700 rounded-lg p-4">
                            <h2 className="text-lg font-semibold dark:text-white mb-4">Thông tin bổ sung</h2>
                            <div className="space-y-2">
                                <div>
                                    <h3 className="font-medium dark:text-white">Phương thức thanh toán</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Thanh toán khi nhận hàng (COD)</p>
                                </div>
                                {order.expectedDeliveryDate && (
                                    <div>
                                        <h3 className="font-medium dark:text-white">Dự kiến giao hàng</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {formatDate(order.expectedDeliveryDate)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}