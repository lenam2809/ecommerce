"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus, ShieldPlus, Cpu } from "lucide-react"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import type { CartItem as CartItemType } from "@/types/cart"

export type CartItemProps = {
    item: CartItemType
    onUpdateQuantity: (itemId: string, quantity: number) => void
    onRemove: (itemId: string) => void
    isUpdating: boolean
    isRemoving: boolean
    appleCareSelected?: boolean
    onToggleAppleCare?: (itemId: string) => void
}

/**
 * CartItem — Hybrid Premium Tech (SSoT 2026)
 * High contrast text-slate-800 on white card surface (#FFFFFF),
 * explicit multiplication formula (e.g. 450.000₫ x 2 = 900.000₫),
 * and attached add-on details if selected.
 */
const CartItem = ({
    item,
    onUpdateQuantity,
    onRemove,
    isUpdating,
    isRemoving,
}: CartItemProps) => {
    const [imgSrc, setImgSrc] = useState(() => formatImageUrl(item.image))
    const [imgFailed, setImgFailed] = useState(false)

    useEffect(() => {
        setImgSrc(formatImageUrl(item.image))
        setImgFailed(false)
    }, [item.image])

    const itemKey = item.id || item.productId
    const lineTotal = item.price * item.quantity

    return (
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-card transition-colors duration-200 last:border-0 hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
            <div className="grid grid-cols-12 gap-3 sm:gap-5 items-center">
                {/* Product Image & Info */}
                <div className="col-span-12 sm:col-span-6 flex items-start sm:items-center gap-3.5">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-surface">
                        {imgFailed || !imgSrc ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-primary/70">
                                <Cpu className="h-8 w-8" />
                            </div>
                        ) : (
                            <Image
                                src={imgSrc}
                                alt={item.name}
                                fill
                                sizes="96px"
                                className="object-contain p-1.5"
                                onError={() => setImgFailed(true)}
                            />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <Link
                            href={`/product/${item.slug || item.productId}`}
                            className="text-small font-bold text-slate-900 dark:text-white hover:text-primary line-clamp-2 transition-colors duration-200 leading-snug"
                        >
                            {item.name}
                        </Link>

                        {/* Variants */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {item.color && (
                                <span className="inline-flex items-center text-tiny font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span>{item.color}</span>
                                </span>
                            )}
                            {item.size && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-tiny text-primary font-semibold">
                                    {item.size}
                                </span>
                            )}
                        </div>

                        {/* Mobile Unit Price */}
                        <div className="mt-1.5 sm:hidden">
                            <span className="text-tiny font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums whitespace-nowrap">
                                Đơn giá: {formatPrice(item.price)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Unit price (Desktop) */}
                <div className="col-span-3 sm:col-span-2 text-center hidden sm:block">
                    <span className="text-small font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums whitespace-nowrap">
                        {formatPrice(item.price)}
                    </span>
                </div>

                {/* Quantity stepper pill (44px touch-friendly) */}
                <div className="col-span-5 sm:col-span-2">
                    <div className="flex items-center justify-start sm:justify-center">
                        <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl h-10 bg-slate-50 dark:bg-slate-900 shadow-2xs">
                            <button
                                type="button"
                                className="w-9 h-full grid place-items-center text-slate-700 dark:text-slate-300 hover:text-primary rounded-l-xl focus-ring disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                aria-label="Giảm số lượng"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-small font-bold text-slate-900 dark:text-white select-none font-mono tabular-nums">
                                {item.quantity}
                            </span>
                            <button
                                type="button"
                                className="w-9 h-full grid place-items-center text-slate-700 dark:text-slate-300 hover:text-primary rounded-r-xl focus-ring disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                                disabled={isUpdating}
                                aria-label="Tăng số lượng"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Line total & Explicit Multiplication Formula + Trash2 Remove */}
                <div className="col-span-7 sm:col-span-2 flex items-center justify-end gap-2.5">
                    <div className="text-right">
                        <span className="block text-small sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums whitespace-nowrap">
                            {formatPrice(lineTotal)}
                        </span>
                        {item.quantity > 1 && (
                            <span className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
                                {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        className="grid place-items-center h-9 w-9 rounded-xl text-slate-500 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus-ring shrink-0"
                        onClick={() => onRemove(itemKey)}
                        disabled={isRemoving}
                        aria-label={`Xóa sản phẩm ${item.name} khỏi giỏ hàng`}
                        title="Xóa sản phẩm khỏi giỏ hàng"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Display attached add-on if present */}
            {item.addOnName && (
                <div className="mt-3.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2.5">
                            <ShieldPlus className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-tiny font-semibold text-slate-800 dark:text-slate-200">
                                {item.addOnName}
                            </span>
                        </div>
                        {item.addOnPrice ? (
                            <span className="text-tiny font-extrabold text-primary tabular-nums whitespace-nowrap font-mono">
                                +{formatPrice(item.addOnPrice)}
                            </span>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CartItem
