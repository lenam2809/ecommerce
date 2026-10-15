// components/cart/EmptyCart.tsx
import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, RefreshCcw, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * EmptyCart — Editorial Minimal
 * Bỏ glow/ping, icon đơn giản, CTA tròn
 */
const EmptyCart = () => {
    return (
        <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-surface border border-line mb-8">
                <ShoppingBag className="h-10 w-10 text-ink-soft" />
            </div>

            <h2 className="section-title">Giỏ hàng của bạn đang trống</h2>
            <p className="text-ink-soft mt-3 mb-10 max-w-md mx-auto">
                Hãy khám phá các sản phẩm công nghệ đỉnh cao và thêm vào bộ sưu tập của bạn.
            </p>

            <Button
                className="h-12 px-8 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold transition-colors"
                asChild
            >
                <Link href="/products" className="flex items-center">
                    Khám phá sản phẩm
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
            </Button>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                    { icon: Truck, title: "Giao hàng siêu tốc", desc: "Nhận hàng trong 24h nội thành" },
                    { icon: CreditCard, title: "Thanh toán bảo mật", desc: "Đa dạng phương thức an toàn" },
                    { icon: RefreshCcw, title: "Đổi trả linh hoạt", desc: "1 đổi 1 trong 30 ngày" }
                ].map((item) => (
                    <div key={item.title} className="border border-line rounded-2xl p-6 hover:border-ink/30 transition-colors duration-200">
                        <div className="w-11 h-11 rounded-full bg-brand-soft flex items-center justify-center mx-auto mb-4">
                            <item.icon className="h-5 w-5 text-brand" />
                        </div>
                        <h3 className="text-small font-semibold text-ink mb-1.5">{item.title}</h3>
                        <p className="text-tiny text-ink-soft">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmptyCart;
