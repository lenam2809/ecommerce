"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { CheckoutFormValues } from "@/types/checkout"
import { formatPrice } from "@/lib/contants"
import {
    Sparkles,
    ShieldCheck,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
} from "lucide-react"

interface PaymentMethodProps {
    form: UseFormReturn<CheckoutFormValues>
    total?: number
}

export function PaymentMethod({ form, total = 62390000 }: PaymentMethodProps) {
    const [isMobileCollapsed, setIsMobileCollapsed] = useState<boolean>(false)
    const selectedPayment = form.watch("paymentMethod")
    const isHighValueOrder = total > 20000000
    const depositAmount = Math.round(total * 0.1)

    const paymentMethods = [
        {
            value: "vnpay",
            image: "/CardImages/vnpay.png",
            alt: "VNPay",
            title: "Cổng thanh toán VNPAY-QR (Khuyên dùng)",
            desc: "Quét mã VNPAY-QR từ 40+ ứng dụng ngân hàng & ví điện tử • Xác nhận tức thì",
            recommended: true,
            badgeText: "Ưu tiên • Miễn phí giao dịch",
        },
        {
            value: "bank",
            image: "/CardImages/bank.png",
            alt: "VietQR",
            title: "Chuyển khoản nhanh VietQR Pro 24/7",
            desc: "Tự động đối soát & xác nhận giao dịch trong 5 giây qua mã QR động",
            recommended: false,
        },
        {
            value: "momo",
            image: "/CardImages/MoMo_Logo.png",
            alt: "MoMo",
            title: "Ví điện tử MoMo",
            desc: "Thanh toán 1-chạm siêu nhanh qua ứng dụng MoMo",
            recommended: false,
        },
        {
            value: "zalopay",
            image: "/CardImages/vnpay.png",
            alt: "ZaloPay",
            title: "Ví điện tử ZaloPay",
            desc: "Thanh toán liền mạch ngay trên Zalo hoặc ứng dụng ZaloPay",
            recommended: false,
            customBadge: "ZaloPay",
        },
        {
            value: "credit",
            image: "/CardImages/CreditCard.png",
            alt: "Credit Card",
            title: "Thẻ quốc tế (Visa / Mastercard / JCB) & Trả góp 0%",
            desc: "Bảo mật chuẩn 3D-Secure • Hỗ trợ chuyển đổi trả góp 0% lãi suất 6 - 12 tháng",
            recommended: false,
        },
        {
            value: "cod",
            image: "/CardImages/cod.png",
            alt: "COD",
            title: "Thanh toán khi nhận hàng (COD)",
            desc: isHighValueOrder
                ? `Đơn hàng > 20.000.000₫: Cần đặt cọc trước 10% (${formatPrice(depositAmount)}) để giữ máy`
                : "Đồng kiểm tra niêm phong sản phẩm và thanh toán trực tiếp cho nhân viên giao hàng",
            recommended: false,
            requiresDeposit: isHighValueOrder,
        },
    ]

    return (
        <div className="bg-card text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {/* Step 2 Accordion Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                        2
                    </span>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Phương thức thanh toán
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Mọi giao dịch đều được bảo mật đa tầng chuẩn quốc tế PCI-DSS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Mã hóa SSL 256-bit</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
                        className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        aria-expanded={!isMobileCollapsed}
                        aria-controls="payment-methods-content"
                        aria-label="Thu gọn hoặc mở rộng phương thức thanh toán"
                    >
                        {isMobileCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div id="payment-methods-content" className={`${isMobileCollapsed ? "hidden lg:block" : "block"} p-5 md:p-6 space-y-4`}>
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-1 gap-3"
                                >
                                    {paymentMethods.map((method) => {
                                        const isSelected = field.value === method.value
                                        return (
                                            <FormItem
                                                key={method.value}
                                                onClick={() => field.onChange(method.value)}
                                                className={`relative flex items-center gap-4 border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                                                    isSelected
                                                        ? "border-primary bg-primary/[0.04] dark:bg-primary/10 ring-2 ring-primary/15"
                                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40"
                                                }`}
                                            >
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={method.value}
                                                        className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
                                                    />
                                                </FormControl>
                                                <Label className="flex items-center justify-between cursor-pointer flex-1 gap-3">
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="relative h-11 w-11 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 p-1.5 flex items-center justify-center border border-slate-200/80 dark:border-slate-700">
                                                            {method.customBadge ? (
                                                                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 tracking-tighter">
                                                                    ZaloPay
                                                                </span>
                                                            ) : (
                                                                <Image
                                                                    src={method.image}
                                                                    alt={method.alt}
                                                                    width={36}
                                                                    height={36}
                                                                    className="object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                                    {method.title}
                                                                </span>
                                                                {method.recommended && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-xs">
                                                                        <Sparkles className="h-3 w-3" />
                                                                        Khuyên dùng
                                                                    </span>
                                                                )}
                                                                {method.requiresDeposit && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                                                                        Cọc 10% đơn &gt; 20Tr
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                                                                {method.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </FormItem>
                                        )
                                    })}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* High-Value COD 10% Deposit Warning Box */}
                {selectedPayment === "cod" && isHighValueOrder && (
                    <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1 leading-relaxed">
                            <p className="font-bold text-sm">
                                Quy định đặt cọc 10% cho đơn hàng COD giá trị cao (&gt; 20.000.000₫)
                            </p>
                            <p>
                                Để đảm bảo quyền lợi giữ sản phẩm nguyên seal chính hãng, quý khách vui lòng đặt cọc trước{" "}
                                <strong className="font-extrabold tabular-nums whitespace-nowrap">
                                    {formatPrice(depositAmount)}
                                </strong>{" "}
                                (10% giá trị đơn hàng) qua VietQR/VNPAY sau khi xác nhận đặt hàng. Phần còn lại{" "}
                                <strong className="font-extrabold tabular-nums whitespace-nowrap">
                                    {formatPrice(total - depositAmount)}
                                </strong>{" "}
                                sẽ thanh toán trực tiếp khi nhận và kiểm tra máy.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
