"use client"

import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { AddressItem } from "./address-item"
import { Address } from "@/types/user"

import Link from "next/link"

/**
 * AddressesTab — Editorial Tech Minimalism
 */
export function AddressesTab({ addresses, isLoadingAddresses, handleSetDefaultAddress, handleDeleteAddress }: {
    addresses: Address[] | undefined
    isLoadingAddresses: boolean
    handleSetDefaultAddress: (id: string) => void
    handleDeleteAddress: (id: string) => void
}) {
    return (
        <div className="rounded-3xl border border-line bg-card shadow-xs overflow-hidden h-full">
            <div className="p-6 md:p-8 border-b border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-tiny font-bold uppercase tracking-widest text-brand mb-1">Sổ địa chỉ</p>
                    <h3 className="text-h2 font-bold tracking-tight text-ink">Địa chỉ nhận hàng</h3>
                    <p className="text-small text-ink-soft mt-1">Quản lý các địa chỉ nhận hàng để thanh toán nhanh hơn</p>
                </div>
                <Button
                    className="rounded-full h-11 px-6 bg-brand text-white hover:bg-brand-hover text-small font-semibold shadow-xs shrink-0"
                    asChild
                >
                    <Link href="/account/addresses/new">
                        Thêm địa chỉ mới
                    </Link>
                </Button>
            </div>

            <div className="p-6 md:p-8">
                {isLoadingAddresses ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    </div>
                ) : addresses && addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {addresses.map((address) => (
                            <AddressItem
                                key={address.id}
                                address={address}
                                onSetDefault={handleSetDefaultAddress}
                                onDelete={handleDeleteAddress}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-surface flex items-center justify-center mb-6">
                            <MapPin className="h-10 w-10 text-ink-faint" />
                        </div>
                        <h3 className="text-h3 font-semibold text-ink mb-2">Chưa có địa chỉ nào</h3>
                        <p className="text-ink-soft mb-8 max-w-sm">
                            Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ giao hàng của bạn.
                        </p>
                        <Button
                            className="rounded-full px-8 h-12 bg-brand text-white hover:bg-brand-hover text-small font-semibold"
                            asChild
                        >
                            <Link href="/account/addresses/new">
                                Thêm địa chỉ mới
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
