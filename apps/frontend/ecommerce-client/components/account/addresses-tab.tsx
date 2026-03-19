"use client"

import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { AddressItem } from "./address-item"
import { AppToaster } from "@/components/toast/app-toaster"
import { Address } from "@/types/user"

export function AddressesTab({ addresses, isLoadingAddresses, handleSetDefaultAddress, handleDeleteAddress }: {
    addresses: Address[] | undefined
    isLoadingAddresses: boolean
    handleSetDefaultAddress: (id: string) => void
    handleDeleteAddress: (id: string) => void
}) {
    return (
        <div className="glass-card rounded-3xl overflow-hidden h-full border-white/5 dark:border-white/5">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-2xl tech-heading pl-2 border-l-4 border-primary/50">Địa chỉ của tôi</h3>
                <Button
                    className="btn-primary rounded-full"
                    size="sm"
                    onClick={() => {
                        AppToaster.info("Chức năng đang được phát triển", {
                            description: "Chức năng thêm địa chỉ mới sẽ sớm được cập nhật.",
                        })
                    }}
                >
                    Thêm địa chỉ mới
                </Button>
            </div>

            <div className="p-8">
                {isLoadingAddresses ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : addresses && addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="h-24 w-24 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                            <MapPin className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 tech-heading">Chưa có địa chỉ nào</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm">
                            Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ giao hàng của bạn.
                        </p>
                        <Button
                            className="btn-glow rounded-full px-8 py-6 text-base"
                            onClick={() => {
                                AppToaster.info("Chức năng đang được phát triển", {
                                    description: "Chức năng thêm địa chỉ mới sẽ sớm được cập nhật.",
                                })
                            }}
                        >
                            Thêm địa chỉ mới
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}