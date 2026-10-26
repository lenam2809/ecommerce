"use client"

import { Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddressItem } from "./address-item"
import { Address } from "@/types/user"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function AddressesTab({
    addresses = [],
    isLoadingAddresses,
    handleSetDefaultAddress,
    handleDeleteAddress,
}: {
    addresses?: Address[]
    isLoadingAddresses: boolean
    handleSetDefaultAddress: (id: string) => void
    handleDeleteAddress: (id: string) => void
}) {
    const list = addresses || []

    return (
        <div className="rounded-2xl border border-line bg-card shadow-xs overflow-hidden">
            <div className="p-6 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/50">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-tech-blue mb-1">
                        Sổ địa chỉ giao nhận
                    </p>
                    <h3 className="text-lg font-extrabold tracking-tight text-ink">
                        Địa chỉ nhận hàng đã lưu ({list.length})
                    </h3>
                    <p className="text-xs text-ink-soft mt-0.5">
                        Đồng bộ tự động khi đặt hàng Siêu tốc 2H trên toàn quốc
                    </p>
                </div>
                <Button
                    className="rounded-xl h-10 px-5 bg-tech-blue text-white hover:bg-tech-blue/90 text-xs font-bold shadow-xs shrink-0 flex items-center gap-1.5"
                    asChild
                >
                    <Link href="/account/addresses/new">
                        <Plus className="h-4 w-4" />
                        <span>Thêm địa chỉ mới</span>
                    </Link>
                </Button>
            </div>

            <div className="p-6">
                {isLoadingAddresses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-40 rounded-2xl" />
                        <Skeleton className="h-40 rounded-2xl" />
                    </div>
                ) : list.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-line bg-surface/30">
                        <div className="w-12 h-12 rounded-xl bg-tech-blue/10 text-tech-blue flex items-center justify-center mx-auto mb-3">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-bold text-ink mb-1">
                            Chưa có địa chỉ giao hàng nào
                        </h4>
                        <p className="text-xs text-ink-soft mb-4">
                            Lưu địa chỉ để việc đặt hàng và nhận giao siêu tốc 2H diễn ra nhanh chóng nhất.
                        </p>
                        <Button
                            size="sm"
                            asChild
                            className="rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 text-xs font-bold"
                        >
                            <Link href="/account/addresses/new">
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Thêm địa chỉ đầu tiên
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {list.map((address) => (
                            <AddressItem
                                key={address.id}
                                address={address}
                                onSetDefault={handleSetDefaultAddress}
                                onDelete={handleDeleteAddress}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
