"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/hooks/use-cart"
import WishlistItem, { WishlistProductItem } from "./wishlist-item"
import EmptyWishlist from "./empty-wishlist"
import WishlistLoading from "./wishlist-loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    Trash2,
    Heart,
    ShoppingCart,
    ArrowLeftRight,
    Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export default function WishlistClient() {
    const router = useRouter()
    const { wishlistItems = [], isLoading, removeFromWishlist } = useWishlist()
    const { addToCart } = useCart()

    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("dateAdded-desc")
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null)

    const activeSourceItems: WishlistProductItem[] = useMemo(() => {
        return (wishlistItems || []).map((w) => ({
            productId: w.productId,
            productName: w.productName,
            price: w.price,
            imageUrl: w.imageUrl,
            slug: w.slug,
            category: "Chính hãng",
            inStock: true,
        }))
    }, [wishlistItems])

    const filteredAndSortedItems = useMemo(() => {
        let items = [...activeSourceItems]

        if (searchQuery) {
            items = items.filter((item) =>
                item.productName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (sortBy === "name-asc") {
            items.sort((a, b) => a.productName.localeCompare(b.productName))
        } else if (sortBy === "name-desc") {
            items.sort((a, b) => b.productName.localeCompare(a.productName))
        } else if (sortBy === "price-asc") {
            items.sort((a, b) => a.price - b.price)
        } else if (sortBy === "price-desc") {
            items.sort((a, b) => b.price - a.price)
        }

        return items
    }, [activeSourceItems, searchQuery, sortBy])

    const allSelected =
        filteredAndSortedItems.length > 0 &&
        selectedItems.size === filteredAndSortedItems.length
    const isIndeterminate =
        selectedItems.size > 0 && selectedItems.size < filteredAndSortedItems.length

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = isIndeterminate
        }
    }, [isIndeterminate])

    const handleSelectItem = (productId: string) => {
        const newSelected = new Set(selectedItems)
        if (newSelected.has(productId)) {
            newSelected.delete(productId)
        } else {
            newSelected.add(productId)
        }
        setSelectedItems(newSelected)
    }

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(filteredAndSortedItems.map((item) => item.productId)))
        }
    }

    const handleRemoveSingle = (productId: string) => {
        removeFromWishlist(productId)
        setSelectedItems((prev) => {
            const next = new Set(prev)
            next.delete(productId)
            return next
        })
    }

    const handleBatchRemove = () => {
        const count = selectedItems.size
        selectedItems.forEach((id) => removeFromWishlist(id))
        setSelectedItems(new Set())
        toast.success(`Đã xóa ${count} sản phẩm đã chọn khỏi danh sách yêu thích`)
    }

    const handleBatchAddToCart = () => {
        const chosenProducts = filteredAndSortedItems.filter((item) =>
            selectedItems.has(item.productId)
        )
        chosenProducts.forEach((prod) => {
            try {
                addToCart({
                    productId: prod.productId,
                    quantity: 1,
                })
            } catch {
                // ignore
            }
        })
        toast.success(`Đã chuyển ${chosenProducts.length} sản phẩm vào giỏ hàng!`)
    }

    const handleBatchCompare = (singleItem?: WishlistProductItem) => {
        const idsToCompare = singleItem
            ? [singleItem.productId]
            : Array.from(selectedItems)

        if (idsToCompare.length === 0) return

        try {
            localStorage.setItem("comparedProducts", JSON.stringify(idsToCompare))
            localStorage.setItem("comparedProductIds", JSON.stringify(idsToCompare))
            window.dispatchEvent(new CustomEvent("comparisonUpdated"))
        } catch {
            // ignore
        }
        router.push(`/compare?ids=${idsToCompare.join(",")}`)
    }

    if (isLoading) return <WishlistLoading />
    if (activeSourceItems.length === 0) return <EmptyWishlist />

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-tech-blue mb-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Lưu trữ &amp; Theo dõi biến động giá</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                        Danh sách sản phẩm yêu thích ({activeSourceItems.length})
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Chọn nhiều thiết bị để chuyển nhanh vào giỏ hàng hoặc so sánh cấu hình chi tiết.
                    </p>
                </div>
            </div>

            {/* Unified Toolbar & Bulk Action Bar */}
            <div className="rounded-2xl bg-card border border-line p-4 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                    {/* Select All */}
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none px-3 py-2 rounded-xl bg-surface border border-line">
                            <input
                                ref={selectAllCheckboxRef}
                                type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                                className="h-4 w-4 rounded cursor-pointer accent-tech-blue"
                                aria-label="Chọn tất cả sản phẩm yêu thích"
                            />
                            <span className="text-xs font-bold text-ink font-mono tabular-nums">
                                {allSelected
                                    ? `Đã chọn tất cả (${filteredAndSortedItems.length})`
                                    : isIndeterminate
                                    ? `Đang chọn ${selectedItems.size} / ${filteredAndSortedItems.length} sản phẩm`
                                    : `Chọn tất cả (${filteredAndSortedItems.length})`}
                            </span>
                        </label>

                        {/* Bulk Actions */}
                        {selectedItems.size > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleBatchAddToCart}
                                    className="h-9 px-4 rounded-xl bg-tech-blue hover:bg-tech-blue/90 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    <span>Chuyển {selectedItems.size} mục vào giỏ</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBatchCompare()}
                                    className="h-9 px-3.5 rounded-xl border-tech-blue/30 text-tech-blue hover:bg-tech-blue/5 text-xs font-bold gap-1.5 cursor-pointer"
                                >
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                    <span>So sánh ({selectedItems.size})</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBatchRemove}
                                    aria-label="Xóa các mục đã chọn khỏi danh sách yêu thích"
                                    className="h-9 px-3.5 rounded-xl border-line text-ink-soft hover:text-brand hover:border-brand/40 text-xs font-bold gap-1.5 cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Xóa mục đã chọn</span>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Search & Sort */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <div className="relative min-w-[220px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                            <Input
                                placeholder="Tìm trong danh sách yêu thích..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-line bg-surface text-xs"
                            />
                        </div>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-line bg-surface text-xs font-semibold">
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-line">
                                <SelectItem value="dateAdded-desc">Mới lưu gần đây</SelectItem>
                                <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
                                <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
                                <SelectItem value="name-asc">Tên sản phẩm A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            {filteredAndSortedItems.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-line">
                    <Heart className="h-8 w-8 text-ink-faint mx-auto mb-3" />
                    <p className="text-sm font-semibold text-ink-soft">
                        Không tìm thấy sản phẩm phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filteredAndSortedItems.map((product) => (
                        <WishlistItem
                            key={product.productId}
                            product={product}
                            isSelected={selectedItems.has(product.productId)}
                            onToggleSelect={handleSelectItem}
                            onRemove={handleRemoveSingle}
                            onCompare={(prod) => handleBatchCompare(prod)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
