"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddressItem } from "./address-item"
import { Address } from "@/types/user"
import Link from "next/link"
import { toast } from "sonner"

export const SSOT_DEFAULT_ADDRESSES: Address[] = [
    {
        id: "addr-vip-1",
        name: "Nguyễn Minh Quân",
        phone: "0909 686 868",
        address: "Tầng 18, Tòa nhà Vietcombank Tower, Số 5 Công Trường Mê Linh",
        ward: "Phường Bến Nghé",
        district: "Quận 1",
        city: "TP. Hồ Chí Minh",
        isDefault: true,
    },
    {
        id: "addr-vip-2",
        name: "Nguyễn Minh Quân",
        phone: "0909 686 868",
        address: "Biệt thự Vinhomes Central Park, 208 Nguyễn Hữu Cảnh",
        ward: "Phường 22",
        district: "Quận Bình Thạnh",
        city: "TP. Hồ Chí Minh",
        isDefault: false,
    },
]

export function AddressesTab({
    addresses,
    isLoadingAddresses,
    handleSetDefaultAddress,
    handleDeleteAddress,
}: {
    addresses: Address[] | undefined
    isLoadingAddresses: boolean
    handleSetDefaultAddress: (id: string) => void
    handleDeleteAddress: (id: string) => void
}) {
    const [localAddresses, setLocalAddresses] = useState<Address[]>(SSOT_DEFAULT_ADDRESSES)

    const displayAddresses =
        addresses && addresses.length > 0 ? addresses : localAddresses

    const onSetDefault = (id: string) => {
        if (addresses && addresses.length > 0) {
            handleSetDefaultAddress(id)
        } else {
            setLocalAddresses((prev) =>
                prev.map((a) => ({ ...a, isDefault: a.id === id }))
            )
            toast.success("Đã cập nhật địa chỉ giao hàng mặc định!")
        }
    }

    const onDelete = (id: string) => {
        if (addresses && addresses.length > 0) {
            handleDeleteAddress(id)
        } else {
            setLocalAddresses((prev) => prev.filter((a) => a.id !== id))
            toast.success("Đã xóa địa chỉ khỏi sổ địa chỉ")
        }
    }

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-primary mb-1">
                        Sổ địa chỉ giao nhận
                    </p>
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Địa chỉ nhận hàng đã lưu ({displayAddresses.length})
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Đồng bộ tự động khi đặt hàng Siêu tốc 2H trên toàn quốc
                    </p>
                </div>
                <Button
                    className="rounded-xl h-10 px-5 bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs shrink-0 flex items-center gap-1.5"
                    asChild
                >
                    <Link href="/account/addresses/new">
                        <Plus className="h-4 w-4" />
                        <span>Thêm địa chỉ mới</span>
                    </Link>
                </Button>
            </div>

            <div className="p-6">
                {isLoadingAddresses && (!addresses || addresses.length === 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayAddresses.map((address) => (
                            <AddressItem
                                key={address.id}
                                address={address}
                                onSetDefault={onSetDefault}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayAddresses.map((address) => (
                            <AddressItem
                                key={address.id}
                                address={address}
                                onSetDefault={onSetDefault}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
