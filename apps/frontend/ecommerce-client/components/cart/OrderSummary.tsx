// components/cart/OrderSummary.tsx
import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, Truck, ShoppingBag, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/contants";
import { cn } from "@/lib/utils";

type OrderSummaryProps = {
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    itemCount: number;
    onApplyPromoCode: (code: string) => void;
    isApplyingPromoCode: boolean;
    promoCodeError?: any;
};

const OrderSummary = ({
    subtotal,
    shippingCost,
    discount,
    total,
    itemCount,
    onApplyPromoCode,
    isApplyingPromoCode,
    promoCodeError,
}: OrderSummaryProps) => {
    const [promoCode, setPromoCode] = useState("");

    const handleApplyPromoCode = () => {
        if (promoCode.trim()) {
            onApplyPromoCode(promoCode);
        }
    };

    return (
        <div className="glass-card rounded-xl overflow-hidden sticky top-24">
            <div className="p-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-3 text-primary" />
                    Tóm tắt đơn hàng
                </h3>
            </div>

            <div className="p-5 md:p-6 space-y-6">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tạm tính ({itemCount} sản phẩm)</span>
                        <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Phí vận chuyển</span>
                        <span className="font-medium">
                            {shippingCost === 0 ? (
                                <span className="text-emerald-500 font-semibold">Miễn phí</span>
                            ) : (
                                formatPrice(shippingCost)
                            )}
                        </span>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between items-center text-emerald-500">
                            <span className="flex items-center"><Tag className="w-3 h-3 mr-1" /> Giảm giá</span>
                            <span className="font-semibold">-{formatPrice(discount)}</span>
                        </div>
                    )}
                </div>

                <Separator className="bg-white/10" />

                <div className="flex justify-between items-end">
                    <span className="text-base font-medium text-foreground">Tổng cộng</span>
                    <div className="text-right">
                        <span className="block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                            {formatPrice(total)}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 block">(Đã bao gồm VAT)</span>
                    </div>
                </div>

                <div className="bg-black/20 p-4 rounded-lg border border-white/10 space-y-3">
                    <h4 className="font-medium text-sm text-foreground flex items-center">
                        <Tag className="h-3 w-3 mr-2" /> Mã giảm giá
                    </h4>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nhập mã code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="bg-white/5 border-white/10 focus-visible:ring-primary/50 h-10 transition-all font-mono text-sm"
                            disabled={isApplyingPromoCode}
                        />
                        <Button
                            variant="outline"
                            onClick={handleApplyPromoCode}
                            disabled={!promoCode.trim() || isApplyingPromoCode}
                            className="bg-transparent border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200"
                        >
                            {isApplyingPromoCode ? "..." : "Áp dụng"}
                        </Button>
                    </div>
                    {discount > 0 && (
                        <p className="text-emerald-500 text-xs flex items-center bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 flex-shrink-0 animate-pulse"></span>
                            Mã giảm giá đã được áp dụng!
                        </p>
                    )}
                    {promoCodeError && (
                        <p className="text-red-500 text-xs flex items-center bg-red-500/10 p-2 rounded border border-red-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2 flex-shrink-0"></span>
                            {promoCodeError?.response?.data?.message || promoCodeError?.message || "Mã giảm giá không hợp lệ"}
                        </p>
                    )}
                </div>

                <div className="pt-2">
                    <Button
                        className="w-full relative overflow-hidden group h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                        asChild
                    >
                        <Link href="/checkout" className="flex items-center justify-center bg-primary hover:bg-primary/90">
                            <span className="relative z-10 flex items-center">
                                Tiến hành thanh toán
                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                        </Link>
                    </Button>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex flex-col items-center justify-center text-center p-3 rounded-lg bg-white/5 border border-white/5">
                            <CreditCard className="h-5 w-5 mb-2 text-primary/80" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Thanh toán an toàn</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-3 rounded-lg bg-white/5 border border-white/5">
                            <Truck className="h-5 w-5 mb-2 text-primary/80" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Giao hàng nhanh</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
