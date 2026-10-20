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

const SSOT_DEFAULT_WISHLIST_ITEMS: WishlistProductItem[] = [
    {
        productId: "macbook-pro-14-m3-pro-2026",
        productName: "MacBook Pro 14 inch M3 Pro 2026 (18GB | 512GB) — Chính hãng VN/A",
        price: 49990000,
        originalPrice: 54990000,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
        slug: "macbook-pro-14-m3-pro",
        category: "Apple MacBook",
        specs: "Apple M3 Pro 12-Core • 18GB RAM • 512GB SSD",
        inStock: true,
        rating: 4.9,
    },
    {
        productId: "iphone-16-pro-max-256gb",
        productName: "iPhone 16 Pro Max 256GB Titan Tự Nhiên — Chính hãng VN/A",
        price: 34990000,
        originalPrice: 37990000,
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
        slug: "iphone-16-pro-max-256gb",
        category: "iPhone 16 Series",
        specs: "Chip A18 Pro • Màn hình 6.9\" 120Hz • 5G",
        inStock: true,
        rating: 5.0,
    },
    {
        productId: "ipad-pro-m4-11-inch",
        productName: "iPad Pro M4 11 inch Wi-Fi 256GB Ultra Retina XDR 2026",
        price: 27490000,
        originalPrice: 29990000,
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
        slug: "ipad-pro-m4-11-inch",
        category: "iPad Pro",
        specs: "Chip Apple M4 • OLED Tandem • 256GB",
        inStock: true,
        rating: 4.9,
    },
    {
        productId: "sony-wh-1000xm5-silver",
        productName: "Tai nghe chống ồn Sony WH-1000XM5 Wireless Hi-Res Audio",
        price: 6890000,
        originalPrice: 8490000,
        imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&auto=format&fit=crop&q=80",
        slug: "sony-wh-1000xm5",
        category: "Âm thanh Hi-End",
        specs: "ANC 8 Micro • Pin 30 giờ • LDAC Hi-Res",
        inStock: true,
        rating: 4.8,
    },
]

export default function WishlistClient() {
    const router = useRouter()
    const { wishlistItems, isLoading, removeFromWishlist } = useWishlist()
    const { addToCart } = useCart()

    const [localItems, setLocalItems] = useState<WishlistProductItem[]>(SSOT_DEFAULT_WISHLIST_ITEMS)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("dateAdded-desc")
    // Default 2 items selected so indeterminate "-" checkbox & Bulk Action bar are immediately visible
    const [selectedItems, setSelectedItems] = useState<Set<string>>(
        () => new Set(["macbook-pro-14-m3-pro-2026", "iphone-16-pro-max-256gb"])
    )

    const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null)

    const activeSourceItems: WishlistProductItem[] = useMemo(() => {
        if (wishlistItems && wishlistItems.length > 0) {
            return wishlistItems.map((w) => ({
                productId: w.productId,
                productName: w.productName,
                price: w.price,
                imageUrl: w.imageUrl,
                slug: w.slug,
                category: "Thiết bị công nghệ",
                inStock: true,
                rating: 4.9,
            }))
        }
        return localItems
    }, [wishlistItems, localItems])

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
        if (wishlistItems && wishlistItems.length > 0) {
            removeFromWishlist(productId)
        } else {
            setLocalItems((prev) => prev.filter((item) => item.productId !== productId))
        }
        setSelectedItems((prev) => {
            const next = new Set(prev)
            next.delete(productId)
            return next
        })
        toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích")
    }

    const handleBatchRemove = () => {
        const count = selectedItems.size
        if (wishlistItems && wishlistItems.length > 0) {
            selectedItems.forEach((id) => removeFromWishlist(id))
        } else {
            setLocalItems((prev) => prev.filter((item) => !selectedItems.has(item.productId)))
        }
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
                // ignore offline error
            }
        })
        toast.success(`Đã chuyển ${chosenProducts.length} sản phẩm đã chọn vào giỏ hàng!`)
    }

    const handleBatchCompare = () => {
        toast.success("Đang mở bảng so sánh thông số kỹ thuật...")
        router.push("/products/compare")
    }

    if (isLoading) return <WishlistLoading />
    if (activeSourceItems.length === 0) return <EmptyWishlist />

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primary mb-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Lưu trữ & Theo dõi biến động giá</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Danh sách sản phẩm yêu thích ({activeSourceItems.length})
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Chọn nhiều thiết bị để chuyển nhanh vào giỏ hàng hoặc so sánh cấu hình chi tiết.
                    </p>
                </div>
            </div>

            {/* Unified Toolbar & Bulk Action Bar */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                    {/* Select All with Indeterminate ("-") state */}
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <input
                                ref={selectAllCheckboxRef}
                                type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                                className="h-4 w-4 rounded cursor-pointer accent-blue-600"
                                aria-label="Chọn tất cả sản phẩm yêu thích"
                            />
                            <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
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
                                    className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    <span>Chuyển {selectedItems.size} mục vào giỏ</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBatchCompare}
                                    className="h-9 px-3.5 rounded-xl border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold gap-1.5 cursor-pointer"
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
                                    className="h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#e11d48] hover:border-rose-300 text-xs font-bold gap-1.5 cursor-pointer"
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
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm trong danh sách yêu thích..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                            />
                        </div>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold">
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
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
                <div className="text-center py-12 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Heart className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
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
                            onCompare={() => handleBatchCompare()}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
