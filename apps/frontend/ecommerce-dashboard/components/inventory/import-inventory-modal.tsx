"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { inventoryService } from "@/services/inventory-service"
import { toast } from "@/hooks/use-toast"

interface ImportInventoryModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ImportInventoryModal({ open, onClose, onSuccess }: ImportInventoryModalProps) {
    const [skuId, setSkuId] = useState("")
    const [serialInput, setSerialInput] = useState("")
    const [batchCode, setBatchCode] = useState("")
    const [loading, setLoading] = useState(false)

    const handleImport = async () => {
        if (!skuId.trim()) {
            toast({ title: "Lỗi", description: "Vui lòng nhập SKU ID", variant: "destructive" })
            return
        }

        const serials = serialInput
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)

        if (serials.length === 0) {
            toast({ title: "Lỗi", description: "Vui lòng nhập ít nhất 1 IMEI/Serial", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const items = serials.map((serialNumber) => ({
                serialNumber,
                batchCode: batchCode.trim() || undefined,
            }))

            const result = await inventoryService.importBatch(skuId.trim(), items)

            if (result.success) {
                toast({
                    title: "Thành công",
                    description: `Đã import ${result.data} IMEI/Serial Number.`,
                })
                setSkuId("")
                setSerialInput("")
                setBatchCode("")
                onSuccess()
            } else {
                const prodMsg = "Something went wrong, please try again later"
                const devMsg = result.error || "Không thể import"
                toast({
                    title: "Lỗi",
                    description: process.env.NODE_ENV === "development" ? devMsg : prodMsg,
                    variant: "destructive",
                })
            }
        } catch {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra khi import", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const serialCount = serialInput
        .split("\n")
        .filter((s) => s.trim().length > 0).length

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import IMEI/Serial Number</DialogTitle>
                    <DialogDescription>
                        Nhập lô IMEI/Serial vào kho cho một SKU sản phẩm. Mỗi dòng là 1 serial number.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sku-id">SKU ID</Label>
                        <Input
                            id="sku-id"
                            placeholder="Nhập Product Variant SKU ID"
                            value={skuId}
                            onChange={(e) => setSkuId(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="batch-code">Batch Code (tùy chọn)</Label>
                        <Input
                            id="batch-code"
                            placeholder="VD: BATCH-2026-03"
                            value={batchCode}
                            onChange={(e) => setBatchCode(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="serials">IMEI/Serial Numbers</Label>
                            <span className="text-xs text-muted-foreground">{serialCount} serial</span>
                        </div>
                        <Textarea
                            id="serials"
                            placeholder={`Mỗi dòng 1 serial number, ví dụ:\n353456789012345\n353456789012346\n353456789012347`}
                            value={serialInput}
                            onChange={(e) => setSerialInput(e.target.value)}
                            rows={8}
                            className="font-mono text-sm"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleImport} disabled={loading || serialCount === 0}>
                        {loading ? "Đang import..." : `Import ${serialCount} serial`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
