"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { ImportInventoryModal } from "@/components/inventory/import-inventory-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { inventoryService } from "@/services/inventory-service"
import { InventoryItem } from "@/types/inventory"
import { IconSearch, IconUpload } from "@tabler/icons-react"
import { toast } from "@/hooks/use-toast"

export default function InventoryPage() {
    const [skuId, setSkuId] = useState("")
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(false)
    const [showImport, setShowImport] = useState(false)

    const handleSearch = async () => {
        if (!skuId.trim()) {
            toast({ title: "Lỗi", description: "Vui lòng nhập SKU ID", variant: "destructive" })
            return
        }
        setLoading(true)
        try {
            const result = await inventoryService.getBySkuId(skuId.trim())
            if (result.success && result.data) {
                setItems(result.data)
            } else {
                toast({ title: "Lỗi", description: result.error || "Không tìm thấy", variant: "destructive" })
                setItems([])
            }
        } catch {
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    const handleImportSuccess = () => {
        setShowImport(false)
        handleSearch() // Refresh
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Kho hàng (IMEI/Serial)"
                text="Quản lý IMEI/Serial Number theo từng SKU sản phẩm."
            />
            <div className="space-y-4">
                {/* Search bar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Nhập SKU ID để tìm kiếm..."
                            value={skuId}
                            onChange={(e) => setSkuId(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? "Đang tìm..." : "Tìm kiếm"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowImport(true)}>
                        <IconUpload className="mr-2 h-4 w-4" />
                        Import IMEI
                    </Button>
                </div>

                {/* Results */}
                {items.length > 0 && <InventoryTable items={items} />}
                {items.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <IconSearch className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">
                            Nhập SKU ID để xem danh sách IMEI/Serial Number
                        </p>
                    </div>
                )}
            </div>

            {/* Import Modal */}
            <ImportInventoryModal
                open={showImport}
                onClose={() => setShowImport(false)}
                onSuccess={handleImportSuccess}
            />
        </DashboardShell>
    )
}
