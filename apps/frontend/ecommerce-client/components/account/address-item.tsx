"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AddressItem({ address, onSetDefault, onDelete }: {
    address: any
    onSetDefault: (id: string) => void
    onDelete: (id: string) => void
}) {
    return (
        <div className="border dark:border-gray-700 rounded-lg p-4 relative">
            {address.isDefault && (
                <Badge className="absolute top-2 right-2 bg-[#2A5CAA]">Mặc định</Badge>
            )}
            <h4 className="font-medium dark:text-white">{address.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{address.phone}</p>
            <p className="text-sm mt-2 dark:text-gray-300">
                {address.address}, {address.city}
            </p>

            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between">
                <div className="space-x-2">
                    <Button variant="outline" size="sm">
                        Chỉnh sửa
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20"
                        onClick={() => onDelete(address.id)}
                    >
                        Xóa
                    </Button>
                </div>

                {!address.isDefault && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetDefault(address.id)}
                    >
                        Đặt làm mặc định
                    </Button>
                )}
            </div>
        </div>
    )
}