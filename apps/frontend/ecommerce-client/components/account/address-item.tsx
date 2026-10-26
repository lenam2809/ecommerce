"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Phone, Pencil, Trash2, Check, ShieldCheck } from "lucide-react"
import { Address } from "@/types/user"

export function AddressItem({
    address,
    onSetDefault,
    onDelete,
}: {
    address: Address
    onSetDefault: (id: string) => void
    onDelete: (id: string) => void
}) {
    return (
        <div
            className={`rounded-2xl p-5 relative transition-all duration-200 border ${
                address.isDefault
                    ? "border-primary bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-primary/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card shadow-2xs"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {address.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        {address.isDefault ? "Văn phòng" : "Nhà riêng"}
                    </span>
                </div>
                {address.isDefault && (
                    <span className="inline-flex items-center gap-1 bg-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        Mặc định
                    </span>
                )}
            </div>

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5 tabular-nums">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{address.phone}</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <span>
                    {address.address}
                    {address.ward ? `, ${address.ward}` : ""}
                    {address.district ? `, ${address.district}` : ""}
                    {address.city ? `, ${address.city}` : ""}
                </span>
            </p>

            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-primary hover:border-primary text-xs font-bold h-8 px-3 cursor-pointer"
                    >
                        <Pencil className="h-3 w-3 mr-1" />
                        Chỉnh sửa
                    </Button>
                    {/* Strictly hide Delete button on Default address (SSoT D3-03 rule) */}
                    {!address.isDefault && (
                        <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Xóa địa chỉ ${address.address}`}
                            className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-brand hover:border-rose-300 text-xs font-bold h-8 px-3 cursor-pointer"
                            onClick={() => onDelete(address.id)}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Xóa
                        </Button>
                    )}
                </div>

                {!address.isDefault && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-primary hover:bg-primary/10 text-xs h-8 px-3 font-bold cursor-pointer"
                        onClick={() => onSetDefault(address.id)}
                    >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Đặt làm mặc định
                    </Button>
                )}
            </div>
        </div>
    )
}
