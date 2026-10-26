"use client"

import { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useLocation } from "@/hooks/use-location"
import { CheckoutFormValues } from "@/types/checkout"
import {
    Truck,
    MapPin,
    Zap,
    Store,
    Plus,
    CheckCircle2,
    FileText,
    ChevronDown,
    ChevronUp,
    Building2,
    Clock,
} from "lucide-react"

import { useShowrooms } from "@/hooks/use-showrooms"
import { useAddresses } from "@/hooks/use-addresses"
import type { CustomerAddress } from "@/types/address"

interface ShippingInformationProps {
    form: UseFormReturn<CheckoutFormValues>
    isMemberMode?: boolean
}

export function ShippingInformation({ form, isMemberMode = true }: ShippingInformationProps) {
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

    const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")
    const { data: showrooms = [] } = useShowrooms()
    const { data: userAddresses = [] } = useAddresses()
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>("")
    const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(!isMemberMode || (userAddresses?.length || 0) === 0)
    const [selectedShowroomId, setSelectedShowroomId] = useState<string>("")
    const [requireVatInvoice, setRequireVatInvoice] = useState<boolean>(false)
    const [vatCompany, setVatCompany] = useState<string>("")
    const [vatTaxCode, setVatTaxCode] = useState<string>("")
    const [vatCompanyAddress, setVatCompanyAddress] = useState<string>("")
    const [isMobileCollapsed, setIsMobileCollapsed] = useState<boolean>(false)

    const city = form.watch("city")
    const district = form.watch("district")

    // Sync default showroom
    useEffect(() => {
        if (showrooms.length > 0 && !selectedShowroomId) {
            setSelectedShowroomId(showrooms[0].id)
        }
    }, [showrooms, selectedShowroomId])

    // Sync delivery method
    useEffect(() => {
        form.setValue("deliveryMethod", deliveryMethod)
        if (deliveryMethod === "pickup") {
            const sr = showrooms.find((s) => s.id === selectedShowroomId) || showrooms[0]
            if (sr) {
                form.setValue("showroomId", sr.id)
                form.setValue("address", `${sr.name} — ${sr.address}`, { shouldValidate: true })
            }
        } else {
            form.setValue("showroomId", undefined)
        }
    }, [deliveryMethod, showrooms, selectedShowroomId, form])

    // Sync saved address when switching between VIP Member & Guest
    useEffect(() => {
        if (isMemberMode && !showNewAddressForm && userAddresses && userAddresses.length > 0) {
            const addr = userAddresses.find((a) => a.id === selectedSavedAddressId) || userAddresses.find((a) => a.isDefault) || userAddresses[0]
            if (addr) {
                setSelectedSavedAddressId(addr.id)
                form.setValue("fullName", addr.fullName, { shouldValidate: true })
                form.setValue("phoneNumber", addr.phone, { shouldValidate: true })
                form.setValue("city", addr.city, { shouldValidate: true })
                form.setValue("district", addr.state, { shouldValidate: true })
                form.setValue("ward", addr.ward || "", { shouldValidate: true })
                form.setValue("address", addr.street, { shouldValidate: true })
            }
        }
    }, [isMemberMode, selectedSavedAddressId, showNewAddressForm, userAddresses, form])

    useEffect(() => {
        if (!isMemberMode || !userAddresses || userAddresses.length === 0) {
            setShowNewAddressForm(true)
        } else {
            setShowNewAddressForm(false)
        }
    }, [isMemberMode, userAddresses])

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

    const handleSelectSavedAddress = (addr: CustomerAddress) => {
        setSelectedSavedAddressId(addr.id)
        setShowNewAddressForm(false)
        form.setValue("fullName", addr.fullName, { shouldValidate: true })
        form.setValue("phoneNumber", addr.phone, { shouldValidate: true })
        form.setValue("city", addr.city, { shouldValidate: true })
        form.setValue("district", addr.state, { shouldValidate: true })
        form.setValue("ward", addr.ward || "", { shouldValidate: true })
        form.setValue("address", addr.street, { shouldValidate: true })
    }

    const handleSwitchToNewAddress = () => {
        setShowNewAddressForm(true)
        setSelectedSavedAddressId("new")
    }

    return (
        <div className="bg-card text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {/* Step 1 Accordion Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                        1
                    </span>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Thông tin giao nhận hàng</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            {deliveryMethod === "delivery"
                                ? "Giao tận nơi hỏa tốc 2H hoặc tiêu chuẩn toàn quốc"
                                : "Giữ hàng miễn phí tại hệ thống 45 Showroom ShopViet"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                        <Zap className="h-3.5 w-3.5 fill-current" />
                        <span>Siêu tốc 2H</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
                        className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        aria-expanded={!isMobileCollapsed}
                        aria-controls="shipping-information-content"
                        aria-label="Thu gọn hoặc mở rộng thông tin giao nhận"
                    >
                        {isMobileCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div id="shipping-information-content" className={`${isMobileCollapsed ? "hidden lg:block" : "block"} p-5 md:p-6 space-y-6`}>
                {/* Hybrid O2O Delivery Mode Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setDeliveryMethod("delivery")}
                        className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                            deliveryMethod === "delivery"
                                ? "bg-card text-primary shadow-xs border border-primary/30"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        <Truck className="h-4 w-4 shrink-0" />
                        <span>Giao hàng tận nơi (Siêu tốc 2H)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeliveryMethod("pickup")}
                        className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                            deliveryMethod === "pickup"
                                ? "bg-card text-primary shadow-xs border border-primary/30"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        <Store className="h-4 w-4 shrink-0" />
                        <span>Nhận tại 45 Showroom (sau 2H)</span>
                    </button>
                </div>

                {/* Mode A: Nhận tại 45 Showroom */}
                {deliveryMethod === "pickup" && (
                    <div className="rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Store className="h-4 w-4" />
                                Chọn Showroom nhận hàng gần bạn (45 chi nhánh toàn quốc)
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                Miễn phí giữ hàng 48H
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                            {showrooms.map((sr) => {
                                const active = selectedShowroomId === sr.id
                                return (
                                    <label
                                        key={sr.id}
                                        onClick={() => {
                                            setSelectedShowroomId(sr.id)
                                            form.setValue("deliveryMethod", "pickup")
                                            form.setValue("showroomId", sr.id)
                                            form.setValue("address", `${sr.name} — ${sr.address}`, { shouldValidate: true })
                                        }}
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                                            active
                                                ? "border-primary bg-card ring-2 ring-primary/15"
                                                : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 hover:border-slate-300"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="showroomPickup"
                                            checked={active}
                                            onChange={() => {
                                                setSelectedShowroomId(sr.id)
                                                form.setValue("deliveryMethod", "pickup")
                                                form.setValue("showroomId", sr.id)
                                                form.setValue("address", `${sr.name} — ${sr.address}`, { shouldValidate: true })
                                            }}
                                            className="mt-1 h-4 w-4 accent-blue-600"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{sr.name}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{sr.address}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Có sẵn hàng • Nhận sau 2H
                                                </span>
                                                {sr.openingHours && (
                                                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Mở cửa: {sr.openingHours}
                                                    </span>
                                                )}
                                                {sr.phone && (
                                                    <span className="text-slate-600 dark:text-slate-400 font-mono">
                                                        Hotline: {sr.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Saved Addresses Radio Cards (when in Member Mode & Delivery) */}
                {isMemberMode && deliveryMethod === "delivery" && userAddresses && userAddresses.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                Sổ địa chỉ đã lưu
                            </span>
                            <button
                                type="button"
                                onClick={handleSwitchToNewAddress}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Thêm địa chỉ mới</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {userAddresses.map((addr) => {
                                const isSelected = !showNewAddressForm && selectedSavedAddressId === addr.id
                                return (
                                    <div
                                        key={addr.id}
                                        onClick={() => handleSelectSavedAddress(addr)}
                                        className={`relative rounded-xl border p-4 transition-all cursor-pointer ${
                                            isSelected
                                                ? "border-primary bg-primary/[0.04] dark:bg-primary/10 ring-2 ring-primary/15"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="savedAddress"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectSavedAddress(addr)}
                                                    className="h-4 w-4 accent-blue-600"
                                                />
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {addr.fullName}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                                                    {addr.addressType || "Địa chỉ"}
                                                </span>
                                            </div>
                                            {addr.isDefault && (
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono tabular-nums">
                                            SĐT: {addr.phone}
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {addr.street}, {addr.ward || ""}, {addr.state || ""}, {addr.city}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Full Address & Contact Form (Always mounted for react-hook-form validation; visible when Guest or "+ Thêm địa chỉ mới" or Pickup contact) */}
                <div className={isMemberMode && !showNewAddressForm && deliveryMethod === "delivery" ? "pt-2 border-t border-slate-100 dark:border-slate-800/80" : ""}>
                    {isMemberMode && showNewAddressForm && (
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                Nhập địa chỉ giao hàng mới
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    if (userAddresses.length > 0) {
                                        handleSelectSavedAddress(userAddresses[0])
                                    } else {
                                        setShowNewAddressForm(false)
                                    }
                                }}
                                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary cursor-pointer"
                            >
                                Quay lại địa chỉ đã lưu
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Họ và tên người nhận *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                autoComplete="name"
                                                placeholder="Ví dụ: Nguyễn Minh Quân"
                                                className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus-visible:ring-primary/40"
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
                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Email nhận hóa đơn điện tử VAT *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                inputMode="email"
                                                autoComplete="email"
                                                placeholder="quan.nguyen@shopviet.vn"
                                                className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus-visible:ring-primary/40"
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
                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Số điện thoại liên hệ *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                inputMode="tel"
                                                autoComplete="tel"
                                                placeholder="0909 686 868"
                                                className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white tabular-nums focus-visible:ring-primary/40"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* 3-level Province / District / Ward selectors — Shown when adding new address or Guest mode */}
                        {(!isMemberMode || showNewAddressForm) && (
                            <>
                                {/* Province / City */}
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    Tỉnh / Thành phố *
                                                </FormLabel>
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
                                                        <SelectTrigger className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-primary">
                                                            <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 max-h-60">
                                                        {provinces.map((province) => (
                                                            <SelectItem key={province.code} value={province.name} className="rounded-lg text-sm">
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
                                                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    Quận / Huyện *
                                                </FormLabel>
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
                                                        <SelectTrigger className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-primary">
                                                            <SelectValue placeholder="Chọn Quận / Huyện" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 max-h-60">
                                                        {districts.map((item) => (
                                                            <SelectItem key={item.code} value={item.name} className="rounded-lg text-sm">
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
                                                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    Phường / Xã *
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={!district || isLoading.wards}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-primary">
                                                            <SelectValue placeholder="Chọn Phường / Xã" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 max-h-60">
                                                        {wards.map((item) => (
                                                            <SelectItem key={item.code} value={item.name} className="rounded-lg text-sm">
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
                                                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    Địa chỉ chi tiết (Số nhà, tên tòa nhà, tên đường) *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        autoComplete="street-address"
                                                        placeholder="Ví dụ: Tầng 18, Tòa nhà Vietcombank Tower, Số 5 Công Trường Mê Linh..."
                                                        className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus-visible:ring-primary/40"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        {/* Note */}
                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Ghi chú giao hàng / Hỗ trợ kỹ thuật (Tùy chọn)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ví dụ: Giao giờ hành chính, hỗ trợ cài đặt macOS & bộ ứng dụng văn phòng..."
                                                className="resize-none rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus-visible:ring-primary/40 min-h-[76px]"
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
                </div>

                {/* Corporate e-VAT Invoice Option */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={requireVatInvoice}
                            onChange={(e) => {
                                setRequireVatInvoice(e.target.checked)
                                form.setValue("requireInvoice", e.target.checked)
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    Xuất hóa đơn điện tử VAT doanh nghiệp (10% VAT đã bao gồm)
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                Hóa đơn GTGT điện tử hợp lệ sẽ được gửi tự động qua email ngay sau khi đơn hàng hoàn tất.
                            </p>
                        </div>
                    </label>

                    {requireVatInvoice && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Tên công ty / Tổ chức *
                                </label>
                                <div className="relative">
                                    <Building2 className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                                    <Input
                                        value={vatCompany}
                                        onChange={(e) => {
                                            setVatCompany(e.target.value)
                                            form.setValue("companyName", e.target.value)
                                        }}
                                        placeholder="Nhập tên đầy đủ trên GPKD"
                                        className="pl-9 h-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Mã số thuế doanh nghiệp *
                                </label>
                                <Input
                                    value={vatTaxCode}
                                    onChange={(e) => {
                                        setVatTaxCode(e.target.value)
                                        form.setValue("taxCode", e.target.value)
                                    }}
                                    inputMode="numeric"
                                    placeholder="Ví dụ: 0316889922"
                                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono tabular-nums"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Địa chỉ trụ sở đăng ký kinh doanh *
                                </label>
                                <Input
                                    value={vatCompanyAddress}
                                    onChange={(e) => {
                                        setVatCompanyAddress(e.target.value)
                                        form.setValue("companyAddress", e.target.value)
                                    }}
                                    placeholder="Nhập địa chỉ theo Giấy phép đăng ký kinh doanh"
                                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Delivery Guarantee Strip */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300">
                    <Truck className="h-4 w-4 text-primary shrink-0" />
                    <span>
                        Đơn hàng thiết bị công nghệ cao cấp được đóng gói <strong>niêm phong 3 lớp chống sốc</strong> và bảo hiểm 100% giá trị hàng hóa trong suốt hành trình vận chuyển.
                    </span>
                </div>
            </div>
        </div>
    )
}
