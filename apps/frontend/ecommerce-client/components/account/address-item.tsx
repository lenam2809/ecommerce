"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Phone, Pencil, Trash2, Check } from "lucide-react"
import { Address } from "@/types/user"

/**
 * AddressItem — Editorial Minimal
 */
export function AddressItem({ address, onSetDefault, onDelete }: {
    address: Address
    onSetDefault: (id: string) => void
    onDelete: (id: string) => void
}) {
    return (
        <div className="border border-line/70 rounded-2xl p-5 relative transition-all duration-200 hover:border-ink/40 bg-card shadow-2xs">
            {address.isDefault && (
                <span className="absolute top-4 right-4 bg-brand text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    Mặc định
                </span>
            )}
            <h4 className="font-semibold text-small text-ink">{address.name}</h4>
            <p className="text-tiny text-ink-soft mt-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-ink-faint" />
                <span>{address.phone}</span>
            </p>
            <p className="text-small text-ink-soft mt-2 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-brand shrink-0" />
                <span>{address.address}, {address.city}</span>
            </p>

            <div className="mt-4 pt-3.5 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full border-line text-ink-soft hover:text-ink text-tiny h-8 px-3">
                        <Pencil className="h-3 w-3 mr-1" />
                        Sửa
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-line text-ink-soft hover:text-brand hover:border-brand hover:bg-brand-soft text-tiny h-8 px-3"
                        onClick={() => onDelete(address.id)}
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Xóa
                    </Button>
                </div>

                {!address.isDefault && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-brand hover:bg-brand-soft text-tiny h-8 px-3 font-semibold"
                        onClick={() => onSetDefault(address.id)}
                    >
                        <Check className="h-3 w-3 mr-1" />
                        Đặt mặc định
                    </Button>
                )}
            </div>
        </div>
    )
}
