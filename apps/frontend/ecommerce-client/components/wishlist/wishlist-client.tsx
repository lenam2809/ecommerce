// components/wishlist/wishlist-client.tsx
"use client"

import { useState, useMemo } from "react"
import { useWishlist } from "@/hooks/use-wishlist"
import WishlistItem from "./wishlist-item"
import EmptyWishlist from "./empty-wishlist"
import WishlistLoading from "./wishlist-loading"
import WishlistError from "./wishlist-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Trash2, Heart } from "lucide-react"
import { useAppToast } from "@/components/toast/use-app-toast"

export default function WishlistClient() {
    const { wishlistItems, isLoading, error, removeFromWishlist, isEmpty } = useWishlist()
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("dateAdded-desc")
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const { toast } = useAppToast()

    // Filter and sort items
    const filteredAndSortedItems = useMemo(() => {
        let items = [...wishlistItems]

        // Filter by search query
        if (searchQuery) {
            items = items.filter((item) =>
                item.productName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Sort
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
    }, [wishlistItems, searchQuery, sortBy])

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
        if (selectedItems.size === filteredAndSortedItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(filteredAndSortedItems.map((item) => item.productId)))
        }
    }

    const handleBatchRemove = () => {
        selectedItems.forEach((id) => removeFromWishlist(id))
        setSelectedItems(new Set())
        toast({
            title: "Thành công",
            description: `Đã xóa ${selectedItems.size} sản phẩm khỏi danh sách yêu thích`,
        })
    }

    if (isLoading) return <WishlistLoading />
    if (error) return <WishlistError />
    if (isEmpty || wishlistItems.length === 0) return <EmptyWishlist />

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 rounded-full border-line bg-card"
                    />
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48 h-11 rounded-full border-line bg-card">
                        <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-line">
                        <SelectItem value="dateAdded-desc">Mới nhất</SelectItem>
                        <SelectItem value="name-asc">Tên A-Z</SelectItem>
                        <SelectItem value="name-desc">Tên Z-A</SelectItem>
                        <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
                        <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Batch Actions */}
            {selectedItems.size > 0 && (
                <div className="flex items-center justify-between gap-3 bg-surface border border-line rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={selectedItems.size === filteredAndSortedItems.length}
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded cursor-pointer accent-brand"
                            aria-label="Chọn tất cả"
                        />
                        <span className="text-small font-medium text-ink">
                            {selectedItems.size} được chọn
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchRemove}
                        className="rounded-full border-line text-ink-soft hover:text-brand hover:border-brand h-9 gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                    </Button>
                </div>
            )}

            {/* Select All option (when no items selected) */}
            {selectedItems.size === 0 && filteredAndSortedItems.length > 0 && (
                <div className="flex items-center gap-3 text-small">
                    <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded cursor-pointer accent-brand"
                        aria-label="Chọn tất cả"
                    />
                    <span className="text-ink-soft">Chọn tất cả ({filteredAndSortedItems.length})</span>
                </div>
            )}

            {/* Items Grid */}
            {filteredAndSortedItems.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="h-8 w-8 text-ink-faint mx-auto mb-3" />
                    <p className="text-ink-soft">Không tìm thấy sản phẩm</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredAndSortedItems.map((product) => (
                        <div
                            key={product.productId}
                            className="relative"
                            onClick={() => handleSelectItem(product.productId)}
                        >
                            {selectedItems.has(product.productId) && (
                                <div className="absolute top-2 left-2 z-30 w-5 h-5 bg-brand rounded-full border border-white flex items-center justify-center">
                                    <span className="text-tiny text-white font-bold">✓</span>
                                </div>
                            )}
                            <div onClick={(e) => e.stopPropagation()}>
                                <WishlistItem
                                    product={product}
                                    onRemove={removeFromWishlist}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
