"use client"

import { UseFormReturn } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { CheckoutFormValues } from "@/types/checkout"
import { CreditCard, Sparkles, ShieldCheck } from "lucide-react"

interface PaymentMethodProps {
    form: UseFormReturn<CheckoutFormValues>
}

/**
 * PaymentMethod — Editorial Tech Minimalism
 * Selection cards with brand border, icons, and special recommendation badge
 */
export function PaymentMethod({ form }: PaymentMethodProps) {
    const paymentMethods = [
        {
            value: "vnpay",
            image: "/CardImages/vnpay.png",
            alt: "VNPay",
            title: "Cổng thanh toán VNPAY (Khuyên dùng)",
            desc: "Quét mã VNPAY-QR từ 40+ ứng dụng ngân hàng và ví điện tử",
            recommended: true,
        },
        {
            value: "bank",
            image: "/CardImages/bank.png",
            alt: "Bank Transfer",
            title: "Chuyển khoản VietQR Pro",
            desc: "Tự động xác nhận giao dịch trong 5 giây, bảo mật cao nhất",
            recommended: false,
        },
        {
            value: "cod",
            image: "/CardImages/cod.png",
            alt: "COD",
            title: "Thanh toán khi nhận hàng (COD)",
            desc: "Kiểm tra sản phẩm và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng",
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
            value: "credit",
            image: "/CardImages/CreditCard.png",
            alt: "Credit Card",
            title: "Thẻ quốc tế (Visa, Mastercard, JCB)",
            desc: "Bảo mật chuẩn quốc tế 3D-Secure và hỗ trợ trả góp qua thẻ tín dụng",
            recommended: false,
        },
    ]

    return (
        <div className="bg-card text-card-foreground rounded-3xl border border-line overflow-hidden shadow-xs">
            <div className="p-5 border-b border-line/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-brand" />
                    <h3 className="text-small font-semibold text-ink">Phương thức thanh toán</h3>
                </div>
                <div className="flex items-center gap-1 text-tiny text-emerald-700 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Mã hóa SSL 256-bit</span>
                </div>
            </div>

            <div className="p-5 md:p-6 space-y-4">
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 gap-3"
                                >
                                    {paymentMethods.map((method) => (
                                        <FormItem
                                            key={method.value}
                                            className="relative flex items-center gap-4 border border-line/70 rounded-2xl p-4 hover:border-ink/40 transition-all duration-200 has-[[data-state=checked]]:border-brand has-[[data-state=checked]]:bg-brand-soft/30 cursor-pointer"
                                        >
                                            <FormControl>
                                                <RadioGroupItem
                                                    value={method.value}
                                                    className="data-[state=checked]:border-brand data-[state=checked]:text-brand"
                                                />
                                            </FormControl>
                                            <Label className="flex items-center justify-between cursor-pointer flex-1 gap-3">
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="relative h-10 w-10 shrink-0 rounded-xl bg-surface-2 p-1.5 flex items-center justify-center border border-line/40">
                                                        <Image
                                                            src={method.image}
                                                            alt={method.alt}
                                                            width={36}
                                                            height={36}
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-small font-semibold text-ink">
                                                                {method.title}
                                                            </span>
                                                            {method.recommended && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold shadow-xs">
                                                                    <Sparkles className="h-2.5 w-2.5" />
                                                                    Ưu tiên
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-tiny text-ink-soft mt-0.5 leading-snug line-clamp-1">
                                                            {method.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Label>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
