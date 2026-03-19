// components/cart/EmptyCart.tsx
import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, RefreshCcw, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyCart = () => {
    return (
        <div className="text-center py-20 px-4">
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8 group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative z-10 w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <ShoppingBag className="h-10 w-10 text-primary group-hover:text-foreground transition-colors duration-300" />
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-full blur-md animate-ping opacity-50"></div>
            </div>

            <h2 className="text-3xl md:text-4xl tech-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg font-light leading-relaxed">
                Hãy khám phá các sản phẩm công nghệ đỉnh cao và thêm vào bộ sưu tập của bạn.
            </p>

            <Button
                className="bg-primary hover:bg-primary/90 px-8 h-14 text-base font-semibold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group relative overflow-hidden"
                asChild
            >
                <Link href="/products" className="flex items-center">
                    <span className="relative z-10 flex items-center">
                        Khám phá sản phẩm
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                </Link>
            </Button>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                    { icon: Truck, title: "Giao hàng siêu tốc", desc: "Nhận hàng trong 24h nội thành" },
                    { icon: CreditCard, title: "Thanh toán bảo mật", desc: "Đa dạng phương thức an toàn" },
                    { icon: RefreshCcw, title: "Đổi trả linh hoạt", desc: "1 đổi 1 trong 30 ngày" }
                ].map((item, index) => (
                    <div key={index} className="glass-card p-6 rounded-xl hover:bg-white/5 transition-colors duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2 text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmptyCart;