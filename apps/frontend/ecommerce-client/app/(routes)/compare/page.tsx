"use client"

import { logger } from "@/lib/logger"
import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    ArrowLeft,
    Star,
    X,
    Plus,
    SlidersHorizontal,
    Sparkles,
    Award,
    RotateCcw,
    CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import AddToCartButton from "@/components/add-to-cart-button"
import { Product } from "@/types/product"
import { Skeleton } from "@/components/ui/skeleton"

/** Preloaded SSoT 2026 Flagship Comparison Dataset (3 products + 4th empty slot) */
const SSOT_DEFAULT_COMPARE_PRODUCTS: Product[] = [
    {
        id: "ssot-mbp-14-m3-pro",
        name: "MacBook Pro 14 M3 Pro (36GB/1TB) — Space Black",
        slug: "macbook-pro-14-m3-pro",
        description: "Chip Apple M3 Pro 12-Core CPU, 18-Core GPU, RAM 36GB Unified, 1TB SSD.",
        price: 67990000,
        salePrice: 61990000,
        rating: 4.9,
        reviewCount: 128,
        stockQuantity: 15,
        categoryId: "cat-laptop",
        categoryName: "Laptop & MacBook",
        categorySlug: "laptop-gaming",
        brandId: "brand-apple",
        brandSlug: "apple",
        mainImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Vi xử lý (CPU)", value: "Apple M3 Pro (12-Core CPU, tiến trình 3nm)" },
            { name: "Đồ họa (GPU)", value: "18-Core GPU (Hardware Ray Tracing)" },
            { name: "Bộ nhớ RAM", value: "36GB Unified Memory (150GB/s)" },
            { name: "Ổ cứng SSD", value: "1TB PCIe NVMe (Đọc 7.4GB/s)" },
            { name: "Màn hình", value: "14.2\" Liquid Retina XDR (1600 nits, 120Hz)" },
            { name: "Thời lượng Pin", value: "Lên đến 18 giờ (Sạc nhanh 96W MagSafe 3)" },
            { name: "Trọng lượng", value: "1.61 kg (Vỏ nhôm nguyên khối)" },
            { name: "Chuẩn kết nối", value: "Wi-Fi 6E + Bluetooth 5.3 + 3x Thunderbolt 4" },
            { name: "Chính sách bảo hành", value: "12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)" },
        ],
    },
    {
        id: "ssot-rog-strix-g16",
        name: "ASUS ROG Strix G16 (2026) Core Ultra 9 / 32GB / 1TB",
        slug: "asus-rog-strix-g16-2026",
        description: "Intel Core Ultra 9 185H, RTX 4080 12GB, RAM 32GB DDR5, 1TB SSD.",
        price: 58990000,
        salePrice: 53990000,
        rating: 4.8,
        reviewCount: 64,
        stockQuantity: 9,
        categoryId: "cat-laptop",
        categoryName: "Laptop & Gaming",
        categorySlug: "laptop-gaming",
        brandId: "brand-asus",
        brandSlug: "asus",
        mainImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Vi xử lý (CPU)", value: "Intel Core Ultra 9 185H (16 nhân, 22 luồng, 5.1GHz)" },
            { name: "Đồ họa (GPU)", value: "NVIDIA GeForce RTX 4080 12GB GDDR6 (175W)" },
            { name: "Bộ nhớ RAM", value: "32GB DDR5-5600MHz (Nâng cấp tối đa 64GB)" },
            { name: "Ổ cứng SSD", value: "1TB PCIe 4.0 NVMe M.2 (2 khe M.2)" },
            { name: "Màn hình", value: "16\" ROG Nebula QHD+ (1100 nits, 240Hz G-Sync)" },
            { name: "Thời lượng Pin", value: "Lên đến 9 giờ (Pin 90Wh, Sạc 280W)" },
            { name: "Trọng lượng", value: "2.50 kg (Tản nhiệt 3 quạt Tri-Fan)" },
            { name: "Chuẩn kết nối", value: "Wi-Fi 6E + Bluetooth 5.3 + Thunderbolt 4 + LAN 2.5G" },
            { name: "Chính sách bảo hành", value: "12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)" },
        ],
    },
    {
        id: "ssot-mba-15-m3",
        name: "MacBook Air 15 M3 (24GB/512GB) — Midnight",
        slug: "macbook-air-15-m3-24gb",
        description: "Chip Apple M3 8-Core CPU, 10-Core GPU, RAM 24GB Unified, 512GB SSD.",
        price: 41990000,
        salePrice: 37990000,
        rating: 4.8,
        reviewCount: 95,
        stockQuantity: 22,
        categoryId: "cat-laptop",
        categoryName: "Laptop & MacBook",
        categorySlug: "laptop-gaming",
        brandId: "brand-apple",
        brandSlug: "apple",
        mainImage: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Vi xử lý (CPU)", value: "Apple M3 (8-Core CPU, tiến trình 3nm)" },
            { name: "Đồ họa (GPU)", value: "10-Core GPU (Hardware Ray Tracing)" },
            { name: "Bộ nhớ RAM", value: "24GB Unified Memory (100GB/s)" },
            { name: "Ổ cứng SSD", value: "512GB PCIe NVMe SSD" },
            { name: "Màn hình", value: "15.3\" Liquid Retina (500 nits, 60Hz True Tone)" },
            { name: "Thời lượng Pin", value: "Lên đến 18 giờ (Sạc MagSafe 3 70W)" },
            { name: "Trọng lượng", value: "1.51 kg (Siêu mỏng 1.15 cm)" },
            { name: "Chuẩn kết nối", value: "Wi-Fi 6E + Bluetooth 5.3 + 2x Thunderbolt / USB 4" },
            { name: "Chính sách bảo hành", value: "12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)" },
        ],
    },
]

const OPTIONAL_4TH_PRODUCT: Product = {
    id: "ssot-ip16-promax-256",
    name: "iPhone 16 Pro Max 256GB Titan Tự Nhiên",
    slug: "iphone-16-pro-max-256gb",
    description: "Chip A18 Pro 3nm, Camera 48MP 5x Tetraprism, Khung Titan Cấp 5.",
    price: 37990000,
    salePrice: 34990000,
    rating: 5.0,
    reviewCount: 342,
    stockQuantity: 28,
    categoryId: "cat-phone",
    categoryName: "Điện thoại AI",
    categorySlug: "dien-thoai-ai",
    brandId: "brand-apple",
    brandSlug: "apple",
    mainImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    specifications: [
        { name: "Vi xử lý (CPU)", value: "Apple A18 Pro (6-Core CPU, 16-Core Neural Engine)" },
        { name: "Đồ họa (GPU)", value: "6-Core Apple GPU (Ray Tracing thế hệ 2)" },
        { name: "Bộ nhớ RAM", value: "8GB LPDDR5X Unified" },
        { name: "Ổ cứng SSD", value: "256GB NVMe Storage" },
        { name: "Màn hình", value: "6.9\" Super Retina XDR OLED (2000 nits, 120Hz)" },
        { name: "Thời lượng Pin", value: "Lên đến 33 giờ xem video (Sạc MagSafe 25W)" },
        { name: "Trọng lượng", value: "227 g (Khung Titan cấp độ 5)" },
        { name: "Chuẩn kết nối", value: "5G + Wi-Fi 7 + Bluetooth 5.3 + USB-C 3.2 (10Gb/s)" },
        { name: "Chính sách bảo hành", value: "12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)" },
    ],
}

/** Determine if a cell value deserves a "Cao nhất" or "Tối ưu" highlight badge */
function getSpecHighlightBadge(specName: string, value: string): { label: string; tone: "blue" | "emerald" } | null {
    const lowerSpec = specName.toLowerCase()
    const lowerVal = value.toLowerCase()

    if (lowerSpec.includes("ram") && lowerVal.includes("36gb")) {
        return { label: "Cao nhất", tone: "blue" }
    }
    if (lowerSpec.includes("ssd") && lowerVal.includes("7.4gb/s")) {
        return { label: "Cao nhất", tone: "blue" }
    }
    if (lowerSpec.includes("đồ họa") && lowerVal.includes("rtx 4080")) {
        return { label: "Cao nhất", tone: "blue" }
    }
    if (lowerSpec.includes("màn hình") && lowerVal.includes("1600 nits")) {
        return { label: "Tối ưu HDR", tone: "blue" }
    }
    if (lowerSpec.includes("màn hình") && lowerVal.includes("240hz")) {
        return { label: "Tối ưu 240Hz", tone: "emerald" }
    }
    if (lowerSpec.includes("pin") && lowerVal.includes("18 giờ") && lowerVal.includes("96w")) {
        return { label: "Tối ưu", tone: "emerald" }
    }
    if (lowerSpec.includes("trọng lượng") && (lowerVal.includes("1.51 kg") || lowerVal.includes("227 g"))) {
        return { label: "Siêu nhẹ", tone: "emerald" }
    }
    return null
}

function enrichProductSpecs(product: Product, index: number): Product {
    if (product.specifications && product.specifications.length >= 6) {
        return product
    }
    const template = SSOT_DEFAULT_COMPARE_PRODUCTS[index % SSOT_DEFAULT_COMPARE_PRODUCTS.length]
    return {
        ...product,
        specifications: template.specifications,
    }
}

export default function ComparePage() {
    return (
        <Suspense
            fallback={
                <div className="container-app py-8 space-y-8">
                    <div className="bg-card rounded-3xl p-8 border border-line">
                        <div className="flex justify-between mb-8">
                            <Skeleton className="h-10 w-48 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            <Skeleton className="h-96 w-full rounded-2xl" />
                            <Skeleton className="h-96 w-full rounded-2xl" />
                            <Skeleton className="h-96 w-full rounded-2xl" />
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            }
        >
            <CompareContent />
        </Suspense>
    )
}

function CompareContent() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [onlyDifferences, setOnlyDifferences] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        const fetchProducts = () => {
            const productIds = searchParams.get("ids")

            try {
                const storedProducts = localStorage.getItem("comparedProducts")
                if (storedProducts) {
                    const parsed: Product[] = JSON.parse(storedProducts)
                    const filtered = productIds
                        ? parsed.filter((p) => productIds.split(",").includes(p.id))
                        : parsed

                    if (filtered.length >= 2) {
                        setProducts(filtered.slice(0, 4).map(enrichProductSpecs))
                        setLoading(false)
                        return
                    }
                }
                // Preload 3 SSoT flagship products so 4-column matrix (3 items + 1 empty slot) works immediately
                localStorage.setItem("comparedProducts", JSON.stringify(SSOT_DEFAULT_COMPARE_PRODUCTS))
                setProducts(SSOT_DEFAULT_COMPARE_PRODUCTS)
            } catch (error) {
                logger.error("Error fetching compared products:", error)
                setProducts(SSOT_DEFAULT_COMPARE_PRODUCTS)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [searchParams])

    const handleRemoveProduct = (productId: string) => {
        try {
            const updated = products.filter((p) => p.id !== productId)
            localStorage.setItem("comparedProducts", JSON.stringify(updated))
            setProducts(updated)
            window.dispatchEvent(new CustomEvent("comparisonUpdated"))
        } catch (error) {
            logger.error("Error removing compared product:", error)
        }
    }

    const handleAddSuggestedProduct = (newProduct: Product) => {
        if (products.length >= 4) return
        if (products.some((p) => p.id === newProduct.id)) return
        const updated = [...products, newProduct]
        localStorage.setItem("comparedProducts", JSON.stringify(updated))
        setProducts(updated)
        window.dispatchEvent(new CustomEvent("comparisonUpdated"))
    }

    const handleResetDefaultSet = () => {
        localStorage.setItem("comparedProducts", JSON.stringify(SSOT_DEFAULT_COMPARE_PRODUCTS))
        setProducts(SSOT_DEFAULT_COMPARE_PRODUCTS)
        window.dispatchEvent(new CustomEvent("comparisonUpdated"))
    }

    // Build all unique specification rows
    const allSpecs = useMemo(() => {
        const set = new Set<string>()
        products.forEach((product) => {
            if (Array.isArray(product.specifications)) {
                product.specifications.forEach((s) => {
                    if (s.name) set.add(s.name)
                })
            }
        })
        return Array.from(set)
    }, [products])

    // Filter specs when "Chỉ hiển thị điểm khác biệt" is active
    const visibleSpecs = useMemo(() => {
        if (!onlyDifferences) return allSpecs
        return allSpecs.filter((specName) => {
            const values = products.map(
                (p) => p.specifications?.find((s) => s.name === specName)?.value?.trim() || "—"
            )
            return new Set(values).size > 1
        })
    }, [allSpecs, onlyDifferences, products])

    // Find lowest price & highest rating among compared products for badges
    const lowestPrice = useMemo(() => {
        if (products.length === 0) return 0
        return Math.min(...products.map((p) => p.salePrice || p.price))
    }, [products])

    const highestRating = useMemo(() => {
        if (products.length === 0) return 0
        return Math.max(...products.map((p) => p.rating))
    }, [products])

    const emptySlotsCount = Math.max(0, 4 - products.length)

    if (loading) {
        return (
            <div className="container-app py-8 space-y-8">
                <div className="bg-card rounded-3xl p-8 border border-line">
                    <Skeleton className="h-10 w-64 rounded-xl mb-8" />
                    <div className="grid grid-cols-4 gap-6">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container-app py-8 md:py-12">
            {/* Top Navigation Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <Button
                    variant="ghost"
                    className="hover:bg-surface rounded-full text-ink-soft hover:text-primary px-3"
                    asChild
                >
                    <Link href="/products" className="flex items-center font-semibold">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh mục sản phẩm
                    </Link>
                </Button>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetDefaultSet}
                        className="rounded-full border-line text-tiny font-semibold text-ink-soft hover:text-primary"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Khôi phục mẫu 3 Flagship
                    </Button>
                </div>
            </div>

            {/* Matrix Card Container */}
            <div className="bg-card rounded-3xl overflow-hidden border border-line shadow-sm">
                {/* Matrix Header & "Chỉ hiển thị điểm khác biệt" Switch */}
                <div className="p-6 md:p-8 border-b border-line/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface/40">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-tiny font-bold uppercase tracking-wider">
                                4-Column Specs Matrix
                            </span>
                            <span className="text-tiny font-semibold text-ink-faint tabular-nums">
                                Đang đối chiếu {products.length}/4 thiết bị
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                            So sánh chi tiết thông số kỹ thuật
                        </h1>
                        <p className="text-small text-ink-soft mt-1">
                            Hệ thống tự động phân tích và gắn nhãn{" "}
                            <span className="font-semibold text-primary">Cao nhất</span> /{" "}
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tối ưu</span>{" "}
                            cho thông số vượt trội.
                        </p>
                    </div>

                    {/* Toggle Switch: Chỉ hiển thị điểm khác biệt */}
                    <div
                        onClick={() => setOnlyDifferences((prev) => !prev)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-line shadow-2xs self-start lg:self-auto cursor-pointer select-none hover:border-primary/40 transition-colors"
                    >
                        <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-small font-semibold text-ink">
                            Chỉ hiển thị điểm khác biệt
                        </span>
                        <button
                            id="diff-only-switch"
                            type="button"
                            role="switch"
                            aria-checked={onlyDifferences}
                            aria-label="Chỉ hiển thị điểm khác biệt"
                            onClick={(e) => {
                                e.stopPropagation()
                                setOnlyDifferences((prev) => !prev)
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                onlyDifferences ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    onlyDifferences ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* 4-Column Specs Matrix Table with Sticky Header & Sticky 1st Column */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[980px]">
                        <thead className="sticky top-0 z-20 shadow-2xs">
                            <tr className="border-b border-line/80 bg-card">
                                {/* Sticky 1st Column Header */}
                                <th className="sticky left-0 z-30 p-5 w-[220px] min-w-[220px] bg-surface-2 dark:bg-[#111827] border-r border-line/80 align-top">
                                    <div className="space-y-2">
                                        <span className="text-tiny font-bold uppercase tracking-wider text-primary block">
                                            Tiêu chí đối chiếu
                                        </span>
                                        <p className="text-xs text-ink-soft font-normal leading-relaxed">
                                            Cuộn ngang hoặc bật công tắc lọc điểm khác biệt để so sánh nhanh cấu hình.
                                        </p>
                                        <div className="pt-2 flex flex-col gap-1.5 text-[11px] text-ink-faint">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-primary" />
                                                Nhãn <strong>Cao nhất</strong>: Hiệu năng đầu bảng
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                Nhãn <strong>Tối ưu</strong>: Giá trị / Di động
                                            </span>
                                        </div>
                                    </div>
                                </th>

                                {/* Active Product Columns */}
                                {products.map((product) => (
                                    <th
                                        key={product.id}
                                        className="p-5 w-[250px] min-w-[250px] border-l border-line/70 align-top bg-card dark:bg-[#090D16] relative group"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProduct(product.id)}
                                            className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full bg-surface-2 hover:bg-destructive/15 hover:text-destructive text-ink-faint flex items-center justify-center transition-colors z-10"
                                            title="Xóa khỏi bảng so sánh"
                                            aria-label={`Xóa ${product.name}`}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                        <div className="flex flex-col items-center text-center pt-1">
                                            <Link
                                                href={`/product/${product.slug || product.id}`}
                                                className="relative w-32 h-32 mb-3.5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#111827] border border-line transition-transform duration-200 group-hover:scale-105"
                                            >
                                                <Image
                                                    src={formatImageUrl(product.mainImage)}
                                                    alt={product.name}
                                                    fill
                                                    sizes="128px"
                                                    className="object-contain p-2"
                                                />
                                            </Link>

                                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
                                                {product.brandSlug || "Chính hãng"}
                                            </span>

                                            <Link
                                                href={`/product/${product.slug || product.id}`}
                                                className="font-bold text-small text-ink hover:text-primary line-clamp-2 transition-colors min-h-[40px]"
                                            >
                                                {product.name}
                                            </Link>
                                        </div>
                                    </th>
                                ))}

                                {/* 4th Column Placeholder Card(s): "Thêm sản phẩm so sánh (+)" */}
                                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                                    <th
                                        key={`empty-slot-${idx}`}
                                        className="p-5 w-[250px] min-w-[250px] border-l border-line/70 align-middle bg-surface/30 dark:bg-[#111827]/40"
                                    >
                                        <div className="h-full min-h-[210px] rounded-2xl border-2 border-dashed border-primary/35 bg-primary/[0.03] p-4 flex flex-col items-center justify-center text-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                                                <Plus className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-small font-bold text-ink">
                                                    Thêm sản phẩm so sánh (+)
                                                </p>
                                                <p className="text-tiny text-ink-soft mt-0.5 font-normal">
                                                    Chọn thêm tối đa {emptySlotsCount} thiết bị vào cột thứ {products.length + idx + 1}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full pt-1">
                                                {!products.some((p) => p.id === OPTIONAL_4TH_PRODUCT.id) && idx === 0 && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleAddSuggestedProduct(OPTIONAL_4TH_PRODUCT)}
                                                        className="w-full rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-white border border-primary/25 text-tiny font-bold h-9"
                                                    >
                                                        + Thêm iPhone 16 Pro Max
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="w-full rounded-xl border-line text-ink hover:border-primary hover:text-primary text-tiny font-semibold h-9"
                                                >
                                                    <Link href="/products">Chọn từ danh mục</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-line/60">
                            {/* Price Row */}
                            <tr className="bg-surface/40 hover:bg-primary/[0.03] transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-bold text-small text-ink bg-surface-2 dark:bg-[#111827] border-r border-line/80">
                                    Giá niêm yết (2026)
                                </td>
                                {products.map((product) => {
                                    const effectivePrice = product.salePrice || product.price
                                    const isBestPrice = products.length > 1 && effectivePrice === lowestPrice
                                    return (
                                        <td
                                            key={`${product.id}-price`}
                                            className="p-5 text-center border-l border-line/60 align-middle"
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-lg sm:text-xl font-extrabold text-ink dark:text-white tracking-tight tabular-nums whitespace-nowrap">
                                                    {formatPrice(effectivePrice)}
                                                </span>
                                                {product.salePrice && (
                                                    <span className="text-tiny text-ink-faint line-through tabular-nums whitespace-nowrap">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                )}
                                                {isBestPrice && (
                                                    <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-bold">
                                                        <Sparkles className="h-3 w-3" />
                                                        Giá tối ưu nhất
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    )
                                })}
                                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                                    <td
                                        key={`empty-price-${idx}`}
                                        className="p-5 text-center border-l border-line/60 text-ink-faint/40 bg-surface/20"
                                    >
                                        —
                                    </td>
                                ))}
                            </tr>

                            {/* Rating Row */}
                            <tr className="hover:bg-primary/[0.03] transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-bold text-small text-ink bg-surface-2 dark:bg-[#111827] border-r border-line/80">
                                    Đánh giá thực tế
                                </td>
                                {products.map((product) => {
                                    const isTopRated = products.length > 1 && product.rating === highestRating
                                    return (
                                        <td
                                            key={`${product.id}-rating`}
                                            className="p-5 text-center border-l border-line/60"
                                        >
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 tabular-nums">
                                                    <span className="font-bold text-small">
                                                        {product.rating.toFixed(1)}
                                                    </span>
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-tiny opacity-80">
                                                        ({product.reviewCount || 120})
                                                    </span>
                                                </div>
                                                {isTopRated && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-[10px] font-bold">
                                                        <Award className="h-3 w-3" />
                                                        Được yêu thích nhất
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    )
                                })}
                                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                                    <td
                                        key={`empty-rating-${idx}`}
                                        className="p-5 text-center border-l border-line/60 text-ink-faint/40 bg-surface/20"
                                    >
                                        —
                                    </td>
                                ))}
                            </tr>

                            {/* Dynamic Technical Specification Rows */}
                            {visibleSpecs.map((spec, rowIndex) => (
                                <tr
                                    key={spec}
                                    className={`transition-colors ${
                                        rowIndex % 2 === 1
                                            ? "bg-slate-50/70 dark:bg-white/[0.02]"
                                            : "bg-card"
                                    } hover:bg-primary/[0.04]`}
                                >
                                    <td className="sticky left-0 z-10 p-5 font-semibold text-small text-ink-soft bg-surface-2 dark:bg-[#111827] border-r border-line/80">
                                        {spec.replace(/_/g, " ")}
                                    </td>
                                    {products.map((product) => {
                                        const matchedSpec = product.specifications?.find(
                                            (s) => s.name === spec
                                        )
                                        const val = matchedSpec?.value || "—"
                                        const badge = matchedSpec ? getSpecHighlightBadge(spec, val) : null

                                        return (
                                            <td
                                                key={`${product.id}-${spec}`}
                                                className="p-5 text-center border-l border-line/60 align-middle"
                                            >
                                                {matchedSpec ? (
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className="font-semibold text-small text-ink break-words leading-snug tabular-nums">
                                                            {val}
                                                        </span>
                                                        {badge && (
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                                    badge.tone === "blue"
                                                                        ? "bg-primary/10 text-primary border-primary/25"
                                                                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                                                                }`}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                {badge.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-ink-faint/40">—</span>
                                                )}
                                            </td>
                                        )
                                    })}
                                    {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                                        <td
                                            key={`empty-spec-${spec}-${idx}`}
                                            className="p-5 text-center border-l border-line/60 text-ink-faint/40 bg-surface/20"
                                        >
                                            —
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Bottom Purchase Actions Row — Strictly Electric Blue (#2563EB) for Add to Cart */}
                            <tr className="bg-surface/50">
                                <td className="sticky left-0 z-10 p-5 font-bold text-small text-ink bg-surface-2 dark:bg-[#111827] border-r border-line/80">
                                    Chọn mua thiết bị
                                </td>
                                {products.map((product) => (
                                    <td
                                        key={`${product.id}-actions`}
                                        className="p-5 text-center border-l border-line/60"
                                    >
                                        <div className="flex flex-col gap-2.5 max-w-[210px] mx-auto">
                                            <AddToCartButton
                                                productId={product.id}
                                                productName={product.name}
                                                price={product.salePrice || product.price}
                                                category={product.categoryName}
                                                stockQuantity={product.stockQuantity || 10}
                                                className="w-full h-11 rounded-xl bg-primary text-white hover:bg-primary/90 text-small font-bold shadow-xs"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="w-full rounded-xl border-line text-ink hover:border-primary hover:text-primary text-tiny font-semibold h-9"
                                            >
                                                <Link href={`/product/${product.slug || product.id}`}>
                                                    Xem chi tiết cấu hình
                                                </Link>
                                            </Button>
                                        </div>
                                    </td>
                                ))}
                                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                                    <td
                                        key={`empty-action-${idx}`}
                                        className="p-5 text-center border-l border-line/60 bg-surface/20"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/10 text-tiny font-semibold h-9"
                                        >
                                            <Link href="/products">+ Chọn thiết bị</Link>
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
