"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type CartActionsProps = {
    onClearCart: () => void
    isClearingCart: boolean
}

/**
 * CartActions — Hybrid Premium Tech (SSoT 2026)
 * Includes confirmation modal (AlertDialog) before clearing all items from the cart.
 */
const CartActions = ({ onClearCart, isClearingCart }: CartActionsProps) => {
    const [open, setOpen] = useState(false)

    return (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <Link
                href="/products"
                className="inline-flex items-center text-small font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors duration-150 focus-ring rounded-lg py-1"
            >
                <ChevronLeft className="h-4 w-4 mr-1.5" />
                Tiếp tục mua sắm thiết bị
            </Link>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        aria-label="Xóa tất cả sản phẩm khỏi giỏ hàng"
                        className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors duration-150 flex items-center text-tiny font-semibold h-10 px-4"
                        disabled={isClearingCart}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isClearingCart ? "Đang xóa..." : "Xóa tất cả"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white font-bold">
                            Xác nhận làm trống giỏ hàng?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                            Toàn bộ sản phẩm và ưu đãi đang chọn trong giỏ hàng sẽ bị xóa. Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                            Giữ lại sản phẩm
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="rounded-xl bg-[#e11d48] text-white hover:bg-[#be123c] font-bold"
                            onClick={() => {
                                onClearCart()
                                setOpen(false)
                            }}
                        >
                            Xác nhận xóa tất cả
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default CartActions
