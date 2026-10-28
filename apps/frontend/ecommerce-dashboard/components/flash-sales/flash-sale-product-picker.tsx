"use client"

import { useState } from "react"
import { useGetProducts } from "@/hooks/use-products"
import { Product } from "@/types/product"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    IconSearch,
    IconPlus,
    IconDeviceLaptop,
    IconCheck,
} from "@tabler/icons-react"

interface FlashSaleProductPickerProps {
    onSelectProduct: (product: Product) => void
    selectedProductIds?: string[]
}

export function FlashSaleProductPicker({
    onSelectProduct,
    selectedProductIds = [],
}: FlashSaleProductPickerProps) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: productsResult, isLoading } = useGetProducts({ pageSize: 50 })
    const products: Product[] = productsResult?.data || []

    const filteredProducts = products.filter((p) => {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return true
        return (
            p.name.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query) ||
            p.code?.toLowerCase().includes(query)
        )
    })

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    const handleSelect = (product: Product) => {
        onSelectProduct(product)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="border-tech-blue/30 text-tech-blue hover:bg-tech-blue/10">
                    <IconPlus className="mr-2 h-4 w-4" /> Thêm sản phẩm vào Flash Sale
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconDeviceLaptop className="h-5 w-5 text-tech-blue" />
                        Chọn sản phẩm mở bán Flash Sale
                    </DialogTitle>
                </DialogHeader>

                <div className="relative my-2">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
                    {isLoading ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            Đang tải danh sách sản phẩm...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            Không tìm thấy sản phẩm phù hợp.
                        </div>
                    ) : (
                        filteredProducts.map((p) => {
                            const isAlreadySelected = selectedProductIds.includes(p.id)
                            const imageUrl = typeof p.mainImage === "string" ? p.mainImage : undefined

                            return (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                        isAlreadySelected
                                            ? "bg-surface/50 opacity-60 border-border"
                                            : "bg-card hover:bg-surface/50 border-border"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={p.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <IconDeviceLaptop className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-foreground truncate">{p.name}</span>
                                                {p.sku && (
                                                    <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                                                        {p.sku}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                <span>
                                                    Giá niêm yết:{" "}
                                                    <strong className="font-mono tabular-nums whitespace-nowrap price-tag text-foreground">
                                                        {formatCurrency(p.price)}
                                                    </strong>
                                                </span>
                                                <span>•</span>
                                                <span>Kho: {p.stockQuantity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={isAlreadySelected}
                                        onClick={() => handleSelect(p)}
                                        className={
                                            isAlreadySelected
                                                ? "bg-muted text-muted-foreground"
                                                : "bg-tech-blue hover:bg-tech-blue/90 text-white"
                                        }
                                    >
                                        {isAlreadySelected ? (
                                            <>
                                                <IconCheck className="mr-1 h-3.5 w-3.5" /> Đã chọn
                                            </>
                                        ) : (
                                            <>
                                                <IconPlus className="mr-1 h-3.5 w-3.5" /> Chọn
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
