"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus } from "lucide-react"
import { formatPrice } from "@/lib/contants"
import type { CartItem as CartItemType } from "@/types/cart"

export type CartItemProps = {
    item: CartItemType
    onUpdateQuantity: (itemId: string, quantity: number) => void
    onRemove: (itemId: string) => void
    isUpdating: boolean
    isRemoving: boolean
}

/**
 * CartItem — Editorial Tech Minimalism
 * Clean row with product thumbnail, variant chips, stepper pill, line total and remove button
 */
const CartItem = ({
    item,
    onUpdateQuantity,
    onRemove,
    isUpdating,
    isRemoving,
}: CartItemProps) => {
    return (
        <div className="p-4 sm:p-5 border-b border-line/60 transition-colors duration-200 last:border-0 hover:bg-surface/30">
            <div className="grid grid-cols-12 gap-3 sm:gap-6 items-center">
                {/* Product Image & Info */}
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3.5">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-2xl border border-line overflow-hidden bg-surface-2/40">
                        <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <Link
                            href={`/products`}
                            className="text-small font-semibold text-ink hover:text-brand line-clamp-2 transition-colors duration-200 focus-ring rounded-sm leading-snug"
                        >
                            {item.name}
                        </Link>

                        {/* Variants */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {item.color && (
                                <span className="inline-flex items-center text-tiny text-ink-soft bg-surface-2 px-2.5 py-0.5 rounded-full border border-line/60">
                                    <span
                                        className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 ring-1 ring-line/80"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span>{item.color}</span>
                                </span>
                            )}
                            {item.size && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-2 border border-line/60 text-tiny text-ink-soft font-medium">
                                    {item.size}
                                </span>
                            )}
                            <span className="text-tiny font-medium text-ink-faint sm:hidden">
                                {formatPrice(item.price)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Unit price (Desktop) */}
                <div className="col-span-3 sm:col-span-2 text-center hidden sm:block">
                    <span className="text-small font-medium text-ink-soft">{formatPrice(item.price)}</span>
                </div>

                {/* Quantity stepper pill */}
                <div className="col-span-6 sm:col-span-2">
                    <div className="flex items-center justify-start sm:justify-center">
                        <div className="flex items-center border border-line rounded-full h-9 bg-card shadow-2xs">
                            <button
                                className="w-8 h-full grid place-items-center text-ink-soft hover:text-ink rounded-l-full focus-ring disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                aria-label="Giảm số lượng"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-tiny font-semibold text-ink select-none">
                                {item.quantity}
                            </span>
                            <button
                                className="w-8 h-full grid place-items-center text-ink-soft hover:text-ink rounded-r-full focus-ring disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                disabled={isUpdating}
                                aria-label="Tăng số lượng"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Line total & Remove */}
                <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-3">
                    <span className="text-small sm:text-base font-bold text-ink tracking-tight">
                        {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                        className="grid place-items-center h-8.5 w-8.5 rounded-full text-ink-faint hover:text-brand hover:bg-brand-soft transition-all duration-200 focus-ring"
                        onClick={() => onRemove(item.productId)}
                        disabled={isRemoving}
                        aria-label="Xóa sản phẩm"
                        title="Xóa sản phẩm khỏi giỏ hàng"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CartItem
