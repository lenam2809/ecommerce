// components/cart/CartItem.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/contants";
import type { CartItem } from "@/types/cart";
import { cn } from "@/lib/utils";

export type CartItemProps = {
    item: CartItem;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string) => void;
    isUpdating: boolean;
    isRemoving: boolean;
};

const CartItem = ({
    item,
    onUpdateQuantity,
    onRemove,
    isUpdating,
    isRemoving,
}: CartItemProps) => {
    return (
        <div className="p-5 border-b border-white/10 hover:bg-white/5 transition-colors duration-200 group last:border-0">
            <div className="grid grid-cols-12 gap-6 items-center">
                <div className="col-span-12 sm:col-span-5">
                    <div className="flex items-center">
                        <div className="relative h-24 w-24 flex-shrink-0 rounded-xl border border-white/10 overflow-hidden bg-black/20 shadow-sm">
                            <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="ml-5">
                            <Link
                                href={`/products/${item.productId}`}
                                className="tech-heading text-base md:text-lg font-medium text-foreground hover:text-primary line-clamp-2 transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                            <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-3">
                                {item.color && (
                                    <div className="flex items-center tech-label text-[10px]">
                                        <span className="inline-block h-3 w-3 rounded-full mr-2 ring-1 ring-white/20" style={{ backgroundColor: item.color }}></span>
                                        <span>{item.color}</span>
                                    </div>
                                )}
                                {item.size && (
                                    <div className="flex items-center tech-label text-[10px] uppercase">
                                        <span className={cn("px-2 py-0.5 rounded bg-white/5 border border-white/10", !item.color && "ml-0")}>
                                            Size {item.size}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-4 sm:col-span-2 text-center hidden sm:block">
                    <span className="text-foreground/80 font-medium tracking-wide">{formatPrice(item.price)}</span>
                </div>

                <div className="col-span-6 sm:col-span-2">
                    <div className="flex items-center justify-start sm:justify-center">
                        <div className="flex items-center bg-black/20 rounded-full border border-white/10 p-1 backdrop-blur-md">
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                aria-label="Giảm số lượng"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => onUpdateQuantity(item.productId, Number.parseInt(e.target.value) || 1)}
                                className="w-10 bg-transparent text-center text-sm font-medium text-foreground focus:outline-none [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                disabled={isUpdating}
                                aria-label="Số lượng"
                            />
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                disabled={isUpdating}
                                aria-label="Tăng số lượng"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-span-6 sm:col-span-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                        <span className="font-semibold text-primary hidden sm:block">{formatPrice(item.price * item.quantity)}</span>
                        <button
                            className="text-muted-foreground hover:text-red-400 transition-colors duration-200 p-2 rounded-full hover:bg-red-500/10 group-hover:text-red-400"
                            onClick={() => onRemove(item.productId)}
                            disabled={isRemoving}
                            aria-label="Xóa sản phẩm"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="text-sm font-medium text-primary sm:hidden mt-2">
                        {formatPrice(item.price * item.quantity)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;