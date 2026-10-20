"use client"

import { useState } from "react"
import Image from "next/image"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import { CartItem } from "@/types/cart"

interface OrderItemProps {
    item: CartItem
}

export function OrderItem({ item }: OrderItemProps) {
    const [imgSrc, setImgSrc] = useState(() => formatImageUrl(item.image))

    return (
        <div className="flex items-start gap-3.5 py-3 first:pt-0">
            <div className="relative h-16 w-16 shrink-0">
                <div className="relative h-full w-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 p-1">
                    <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        onError={() => setImgSrc("/placeholder.svg")}
                    />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shadow-xs ring-2 ring-white dark:ring-[#111827] z-10 tabular-nums">
                    {item.quantity}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {item.name}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {item.color && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                            {item.color}
                        </span>
                    )}
                    {item.size && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                            {item.size}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {formatPrice(item.price)} × {item.quantity}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                    </span>
                </div>
            </div>
        </div>
    )
}
