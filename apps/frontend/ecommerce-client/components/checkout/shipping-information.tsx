"use client"

import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useLocation } from "@/hooks/use-location"
import { CheckoutFormValues } from "@/types/checkout"
import { Truck, MapPin, Zap } from "lucide-react"

interface ShippingInformationProps {
    form: UseFormReturn<CheckoutFormValues>
}

export function ShippingInformation({ form }: ShippingInformationProps) {
    const {
        provinces,
        districts,
        wards,
        isLoading,
        fetchDistricts,
        fetchWards,
        setDistricts,
        setWards,
    } = useLocation()

    const city = form.watch("city")
    const district = form.watch("district")

    // Handle initial data loading or when city/district matches available data
    useEffect(() => {
        if (city && provinces.length > 0) {
            const province = provinces.find((p) => p.name === city)
            if (province) {
                fetchDistricts(province.code)
            }
        }
    }, [city, provinces, fetchDistricts])

    useEffect(() => {
        if (district && districts.length > 0) {
            const d = districts.find((item) => item.name === district)
            if (d) {
                fetchWards(d.code)
            }
        }
    }, [district, districts, fetchWards])

    return (
        <div className="bg-card text-card-foreground rounded-3xl border border-line overflow-hidden shadow-xs">
            <div className="p-5 border-b border-line/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand" />
                    <h3 className="text-small font-semibold text-ink">Thông tin nhận hàng</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-tiny font-semibold">
                    <Zap className="h-3 w-3" />
                    <span>Giao hàng siêu tốc 2H</span>
                </div>
            </div>

            <div className="p-5 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Họ và tên người nhận *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            className="h-11 rounded-xl border-line bg-surface/50 text-small text-ink focus-visible:ring-brand/40"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Email nhận hóa đơn VAT *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="vidu@gmail.com"
                                            className="h-11 rounded-xl border-line bg-surface/50 text-small text-ink focus-visible:ring-brand/40"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Số điện thoại liên hệ *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="0912 xxx xxx"
                                            className="h-11 rounded-xl border-line bg-surface/50 text-small text-ink focus-visible:ring-brand/40"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Province / City */}
                    <div>
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Tỉnh / Thành phố *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            form.setValue("district", "")
                                            form.setValue("ward", "")
                                            const p = provinces.find((p) => p.name === value)
                                            if (p) fetchDistricts(p.code)
                                            else setDistricts([])
                                        }}
                                        value={field.value}
                                        disabled={isLoading.provinces}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-xl border-line bg-surface/50 text-small text-ink focus:ring-brand">
                                                <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-line max-h-60">
                                            {provinces.map((province) => (
                                                <SelectItem key={province.code} value={province.name} className="rounded-lg text-small">
                                                    {province.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* District */}
                    <div>
                        <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Quận / Huyện *</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            form.setValue("ward", "")
                                            const d = districts.find((item) => item.name === value)
                                            if (d) fetchWards(d.code)
                                            else setWards([])
                                        }}
                                        value={field.value}
                                        disabled={!city || isLoading.districts}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-xl border-line bg-surface/50 text-small text-ink focus:ring-brand">
                                                <SelectValue placeholder="Chọn Quận / Huyện" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-line max-h-60">
                                            {districts.map((item) => (
                                                <SelectItem key={item.code} value={item.name} className="rounded-lg text-small">
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Ward */}
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="ward"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Phường / Xã *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!district || isLoading.wards}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-xl border-line bg-surface/50 text-small text-ink focus:ring-brand">
                                                <SelectValue placeholder="Chọn Phường / Xã" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-line max-h-60">
                                            {wards.map((item) => (
                                                <SelectItem key={item.code} value={item.name} className="rounded-lg text-small">
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Address Detail */}
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Địa chỉ chi tiết (Số nhà, tên tòa nhà, tên đường) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ví dụ: Tầng 5, Tòa Landmark, 123 Lê Lợi..."
                                            className="h-11 rounded-xl border-line bg-surface/50 text-small text-ink focus-visible:ring-brand/40"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Note */}
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-small font-medium text-ink">Ghi chú giao hàng (Tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ví dụ: Giao giờ hành chính, gọi điện trước khi tới 15 phút..."
                                            className="resize-none rounded-xl border-line bg-surface/50 text-small text-ink focus-visible:ring-brand/40 min-h-[80px]"
                                            maxLength={500}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Delivery Guarantee Strip */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-2/60 border border-line/60 text-tiny text-ink-soft">
                    <Truck className="h-4 w-4 text-brand shrink-0" />
                    <span>
                        Đơn hàng sẽ được nhân viên chuyên nghiệp của ShopViet kiểm tra và đóng gói niêm phong 3 lớp trước khi giao.
                    </span>
                </div>
            </div>
        </div>
    )
}
