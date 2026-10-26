"use client"

import { ProfileTab } from "@/components/account/profile-tab"
import { AddressesTab } from "@/components/account/addresses-tab"
import { useUser, useAddresses } from "@/hooks/use-user"
import { useEffect, useState } from "react"
import { User } from "@/types/user"
import { FormUpdateUserSchema } from "@/schemas/user-schema"
import { Package, RotateCcw, Award, Crown, Sparkles, CheckCircle2 } from "lucide-react"

import { useMyOrders } from "@/hooks/use-orders"
import returnService from "@/services/return-service"

export default function AccountPage() {
    const { user, isLoading: isLoadingUser, updateUser, isUpdatingUser } = useUser()
    const {
        addresses,
        isLoading: isLoadingAddresses,
        setDefaultAddress,
        deleteAddress,
    } = useAddresses()
    const { data: myOrders = [] } = useMyOrders()
    const [returnsCount, setReturnsCount] = useState<number>(0)

    useEffect(() => {
        returnService.getMyReturns().then((res) => {
            if (res.data) setReturnsCount(res.data.length)
        }).catch(() => {})
    }, [])

    const [userData, setUserData] = useState<User>({
        id: user?.id || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        fullName: user?.fullName || "",
        email: user?.email || "",
        avatar: user?.avatar || "",
        phoneNumber: user?.phoneNumber || "",
    })

    const handleSubmit = async (data: FormUpdateUserSchema) => {
        updateUser(data)
    }

    useEffect(() => {
        if (!isLoadingUser && user) {
            setUserData({
                id: user.id,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                fullName: user.fullName || [user.lastName, user.firstName].filter(Boolean).join(" "),
                email: user.email || "",
                avatar: user.avatar || "",
                phoneNumber: user.phoneNumber || "",
            })
        }
    }, [isLoadingUser, user])

    const displayName = user?.fullName || [user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.email || "quý khách"

    return (
        <div className="space-y-6">
            {/* VIP Diamond Tier Progress Banner (SSoT D3-03) */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white p-6 md:p-7 shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                            <Crown className="h-3.5 w-3.5" />
                            <span>ShopViet Privilege • Hạng Thành Viên</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                            Xin chào, {displayName}!
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                            {typeof user?.loyaltyPoints === "number" ? (
                                <>Tích lũy hiện tại: <strong className="text-amber-400 font-mono tabular-nums">{user.loyaltyPoints.toLocaleString("vi-VN")} điểm</strong> • </>
                            ) : null}
                            Mở khóa toàn bộ đặc quyền Freeship Hỏa tốc 2H và Bảo hành 1 đổi 1 ưu tiên tại 45 Showroom toàn quốc.
                        </p>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 min-w-[260px] space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">Đặc quyền hội viên ShopViet</span>
                            <span className="font-extrabold text-amber-400">Chính hãng 100%</span>
                        </div>
                        <div className="space-y-1 text-[11px] text-slate-300">
                            <p className="flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                                <span>Miễn phí vận chuyển đơn từ 500k</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                                <span>Bảo hành 24T ủy quyền tại 45 Showroom</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 flex items-center gap-4 shadow-xs">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                            Đơn hàng năm 2026
                        </p>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono tabular-nums">
                            {myOrders.length} đơn hàng
                        </h3>
                        <p className="text-xs text-tech-blue font-semibold">
                            Cập nhật theo thời gian thực
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 flex items-center gap-4 shadow-xs">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <RotateCcw className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                            Bảo hành &amp; Đổi trả
                        </p>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono tabular-nums">
                            {returnsCount} yêu cầu
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Hỗ trợ lấy ngay 15p tại 45 Showroom
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 flex items-center gap-4 shadow-xs">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                            Đặc quyền thành viên
                        </p>
                        <h3 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            Freeship 500K
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Giao hỏa tốc 2H toàn quốc</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* View-Only Profile Card with Inline Edit */}
            <ProfileTab
                userData={userData}
                isLoadingUser={false}
                isUpdatingUser={isUpdatingUser}
                handleSubmit={handleSubmit}
            />

            {/* Address Book Card (Integrated directly on D3-03 Profile & Address Book screen) */}
            <AddressesTab
                addresses={addresses}
                isLoadingAddresses={isLoadingAddresses}
                handleSetDefaultAddress={(id) => setDefaultAddress(id)}
                handleDeleteAddress={(id) => deleteAddress(id)}
            />
        </div>
    )
}
