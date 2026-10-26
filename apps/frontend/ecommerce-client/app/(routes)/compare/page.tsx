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
    Trash2,
    CheckCircle2,
    Scale,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import AddToCartButton from "@/components/add-to-cart-button"
import { Product } from "@/types/product"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompareMatrix } from "@/hooks/use-compare-matrix"

/** Determine if a cell value deserves a "Cao nhất" or "Tối ưu" highlight badge */
function getSpecHighlightBadge(specName: string, value: string): { label: string; tone: "blue" | "emerald" } | null {
    const lowerSpec = specName.toLowerCase()
    const lowerVal = value.toLowerCase()

    if (lowerVal === "—" || !lowerVal) return null

    if (lowerSpec.includes("ram") && (lowerVal.includes("64gb") || lowerVal.includes("36gb") || lowerVal.includes("32gb"))) {
        return { label: "Cao nhất", tone: "blue" }
    }
    if (lowerSpec.includes("ssd") && (lowerVal.includes("2tb") || lowerVal.includes("7.4gb/s") || lowerVal.includes("pcie 4.0"))) {
        return { label: "Cao nhất", tone: "blue" }
    }
    if (lowerSpec.includes("đồ họa") && (lowerVal.includes("rtx 4080") || lowerVal.includes("rtx 4090") || lowerVal.includes("ray tracing"))) {
        return { label: "Hiệu năng cao", tone: "blue" }
    }
    if (lowerSpec.includes("màn hình") && (lowerVal.includes("1600 nits") || lowerVal.includes("2000 nits") || lowerVal.includes("xdr"))) {
        return { label: "Tối ưu HDR", tone: "blue" }
    }
    if (lowerSpec.includes("màn hình") && (lowerVal.includes("240hz") || lowerVal.includes("165hz") || lowerVal.includes("120hz"))) {
        return { label: "Tần số cao", tone: "emerald" }
    }
    if (lowerSpec.includes("pin") && (lowerVal.includes("18 giờ") || lowerVal.includes("20 giờ") || lowerVal.includes("33 giờ"))) {
        return { label: "Thời lượng pin dài", tone: "emerald" }
    }
    if (lowerSpec.includes("trọng lượng") && (lowerVal.includes("1.5") || lowerVal.includes("1.2") || lowerVal.includes("227 g") || lowerVal.includes("siêu mỏng"))) {
        return { label: "Siêu nhẹ", tone: "emerald" }
    }
    return null
}

function getInitialProductIds(searchParamIds: string | null): string[] {
    if (searchParamIds) {
        return searchParamIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 4)
    }
    if (typeof window !== "undefined") {
        try {
            const raw = localStorage.getItem("comparedProducts") || localStorage.getItem("comparedProductIds")
            if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) {
                    return parsed
                        .map((item) => (typeof item === "string" ? item : item?.id))
                        .filter(Boolean)
                        .slice(0, 4)
                }
            }
        } catch (e) {
            logger.error("Error reading initial compared products:", e)
        }
    }
    return []
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
    const searchParams = useSearchParams()
    const [productIds, setProductIds] = useState<string[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [onlyDifferences, setOnlyDifferences] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const initial = getInitialProductIds(searchParams.get("ids"))
        setProductIds(initial)
    }, [searchParams])

    const { data: matrixData, isLoading } = useCompareMatrix(productIds)

    const products: Product[] = useMemo(() => {
        return matrixData?.products || []
    }, [matrixData])

    const handleRemoveProduct = (productId: string) => {
        try {
            const updated = productIds.filter((id) => id !== productId)
            setProductIds(updated)
            localStorage.setItem("comparedProducts", JSON.stringify(updated))
            localStorage.setItem("comparedProductIds", JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent("comparisonUpdated"))
        } catch (error) {
            logger.error("Error removing compared product:", error)
        }
    }

    const handleClearAll = () => {
        try {
            setProductIds([])
            localStorage.removeItem("comparedProducts")
            localStorage.removeItem("comparedProductIds")
            window.dispatchEvent(new CustomEvent("comparisonUpdated"))
        } catch (error) {
            logger.error("Error clearing compared products:", error)
        }
    }

    // Unified specification rows
    // Prefer matrixData.specGroups if provided; otherwise extract from products.specifications
    const specRows = useMemo(() => {
        if (!products.length) return []

        if (matrixData?.specGroups && matrixData.specGroups.length > 0) {
            const rows: { groupName: string; name: string; values: Record<string, string> }[] = []
            for (const group of matrixData.specGroups) {
                for (const spec of group.specs) {
                    rows.push({
                        groupName: group.groupName || "Thông số kỹ thuật",
                        name: spec.name,
                        values: spec.values || {},
                    })
                }
            }
            return rows
        }

        // Fallback: extract unique spec names from products
        const specNameSet = new Set<string>()
        products.forEach((p) => {
            p.specifications?.forEach((s) => {
                if (s.name) specNameSet.add(s.name)
            })
        })

        return Array.from(specNameSet).map((name) => {
            const values: Record<string, string> = {}
            products.forEach((p) => {
                const match = p.specifications?.find((s) => s.name === name)
                values[p.id] = match?.value || "—"
            })
            return {
                groupName: "Thông số kỹ thuật",
                name,
                values,
            }
        })
    }, [products, matrixData])

    // Filter specs when "Chỉ hiển thị điểm khác biệt" is active
    const visibleSpecRows = useMemo(() => {
        if (!onlyDifferences) return specRows
        return specRows.filter((row) => {
            const values = products.map((p) => (row.values[p.id] || "—").trim().toLowerCase())
            return new Set(values).size > 1
        })
    }, [specRows, onlyDifferences, products])

    // Lowest price & highest rating
    const lowestPrice = useMemo(() => {
        if (products.length === 0) return 0
        return Math.min(...products.map((p) => p.salePrice || p.price))
    }, [products])

    const highestRating = useMemo(() => {
        if (products.length === 0) return 0
        return Math.max(...products.map((p) => p.rating || 0))
    }, [products])

    const emptySlotsCount = Math.max(0, 4 - products.length)

    if (!isMounted || (isLoading && productIds.length > 0)) {
        return (
            <div className="container-app py-8 md:py-12 space-y-8">
                <div className="bg-card rounded-3xl p-8 border border-line">
                    <Skeleton className="h-10 w-64 rounded-xl mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    // Empty state when no products are compared
    if (products.length === 0) {
        return (
            <div className="container-app py-12 md:py-16">
                <div className="max-w-xl mx-auto text-center bg-card rounded-3xl p-8 sm:p-12 border border-line shadow-xs">
                    <div className="w-16 h-16 rounded-2xl bg-tech-blue/10 text-tech-blue flex items-center justify-center mx-auto mb-6">
                        <Scale className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-ink mb-3">
                        Chưa có sản phẩm nào trong bảng so sánh
                    </h1>
                    <p className="text-small text-ink-soft mb-8 leading-relaxed">
                        Hãy chọn tối đa 4 thiết bị công nghệ từ danh mục sản phẩm của ShopViet để đối chiếu chi tiết thông số kỹ thuật, cấu hình và giá bán.
                    </p>
                    <Button
                        asChild
                        className="rounded-xl bg-tech-blue hover:bg-tech-blue/90 text-white font-bold h-11 px-8 shadow-xs"
                    >
                        <Link href="/products">
                            <Plus className="mr-2 h-4 w-4" />
                            Khám phá danh mục sản phẩm
                        </Link>
                    </Button>
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
                    className="hover:bg-surface rounded-full text-ink-soft hover:text-tech-blue px-3"
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
                        onClick={handleClearAll}
                        className="rounded-full border-line text-tiny font-semibold text-ink-soft hover:text-brand hover:border-brand/40"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Xóa tất cả ({products.length})
                    </Button>
                </div>
            </div>

            {/* Matrix Card Container */}
            <div className="bg-card rounded-3xl overflow-hidden border border-line shadow-sm">
                {/* Matrix Header & "Chỉ hiển thị điểm khác biệt" Switch */}
                <div className="p-6 md:p-8 border-b border-line/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface/40">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-tech-blue/10 text-tech-blue border border-tech-blue/20 text-tiny font-bold uppercase tracking-wider">
                                4-Column Specs Matrix
                            </span>
                            <span className="text-tiny font-semibold text-ink-faint tabular-nums font-mono">
                                Đang đối chiếu {products.length}/4 thiết bị
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                            So sánh chi tiết thông số kỹ thuật
                        </h1>
                        <p className="text-small text-ink-soft mt-1">
                            Hệ thống tự động phân tích và gắn nhãn{" "}
                            <span className="font-semibold text-tech-blue">Cao nhất</span> /{" "}
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tối ưu</span>{" "}
                            cho thông số vượt trội.
                        </p>
                    </div>

                    {/* Toggle Switch: Chỉ hiển thị điểm khác biệt */}
                    <div
                        onClick={() => setOnlyDifferences((prev) => !prev)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-line shadow-2xs self-start lg:self-auto cursor-pointer select-none hover:border-tech-blue/40 transition-colors"
                    >
                        <SlidersHorizontal className="h-4 w-4 text-tech-blue shrink-0" />
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
                                onlyDifferences ? "bg-tech-blue" : "bg-slate-300 dark:bg-slate-700"
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
                                <th className="sticky left-0 z-30 p-5 w-[220px] min-w-[220px] bg-surface-2 dark:bg-card border-r border-line/80 align-top">
                                    <div className="space-y-2">
                                        <span className="text-tiny font-bold uppercase tracking-wider text-tech-blue block">
                                            Tiêu chí đối chiếu
                                        </span>
                                        <p className="text-xs text-ink-soft font-normal leading-relaxed">
                                            Cuộn ngang hoặc bật công tắc lọc điểm khác biệt để so sánh nhanh cấu hình.
                                        </p>
                                        <div className="pt-2 flex flex-col gap-1.5 text-[11px] text-ink-faint">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-tech-blue" />
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
                                        className="p-5 w-[250px] min-w-[250px] border-l border-line/70 align-top bg-card relative group"
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
                                                className="relative w-32 h-32 mb-3.5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-card border border-line transition-transform duration-200 group-hover:scale-105"
                                            >
                                                <Image
                                                    src={formatImageUrl(product.mainImage)}
                                                    alt={product.name}
                                                    fill
                                                    sizes="128px"
                                                    className="object-contain p-2"
                                                />
                                            </Link>

                                            <span className="text-[11px] font-bold uppercase tracking-wider text-tech-blue mb-1">
                                                {product.brandSlug || "Chính hãng"}
                                            </span>

                                            <Link
                                                href={`/product/${product.slug || product.id}`}
                                                className="font-bold text-small text-ink hover:text-tech-blue line-clamp-2 transition-colors min-h-[40px]"
                                            >
                                                {product.name}
                                            </Link>
                                        </div>
                                    </th>
                                ))}

                                {/* Empty Slots Placeholders */}
                                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                                    <th
                                        key={`empty-slot-${idx}`}
                                        className="p-5 w-[250px] min-w-[250px] border-l border-line/70 align-middle bg-surface/30 dark:bg-card/40"
                                    >
                                        <div className="h-full min-h-[210px] rounded-2xl border-2 border-dashed border-tech-blue/35 bg-tech-blue/[0.03] p-4 flex flex-col items-center justify-center text-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-tech-blue/10 text-tech-blue flex items-center justify-center shadow-2xs">
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
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="w-full rounded-xl border-line text-ink hover:border-tech-blue hover:text-tech-blue text-tiny font-semibold h-9"
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
                            <tr className="bg-surface/40 hover:bg-tech-blue/[0.03] transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-bold text-small text-ink bg-surface-2 dark:bg-card border-r border-line/80">
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
                                                <span className="text-lg sm:text-xl font-extrabold text-brand tracking-tight font-mono tabular-nums whitespace-nowrap">
                                                    {formatPrice(effectivePrice)}
                                                </span>
                                                {product.salePrice && product.salePrice < product.price && (
                                                    <span className="text-tiny text-ink-faint line-through font-mono tabular-nums whitespace-nowrap">
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
                            <tr className="hover:bg-tech-blue/[0.03] transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-bold text-small text-ink bg-surface-2 dark:bg-card border-r border-line/80">
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
                                                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono tabular-nums">
                                                    <span className="font-bold text-small">
                                                        {(product.rating || 5).toFixed(1)}
                                                    </span>
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-tiny opacity-80">
                                                        ({product.reviewCount || 0})
                                                    </span>
                                                </div>
                                                {isTopRated && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tech-blue/10 text-tech-blue border border-tech-blue/25 text-[10px] font-bold">
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

                            {/* Dynamic Specification Rows */}
                            {visibleSpecRows.map((row, rowIndex) => (
                                <tr
                                    key={`${row.groupName}-${row.name}`}
                                    className={`transition-colors ${
                                        rowIndex % 2 === 1
                                            ? "bg-slate-50/70 dark:bg-white/[0.02]"
                                            : "bg-card"
                                    } hover:bg-tech-blue/[0.04]`}
                                >
                                    <td className="sticky left-0 z-10 p-5 font-semibold text-small text-ink-soft bg-surface-2 dark:bg-card border-r border-line/80">
                                        {row.name.replace(/_/g, " ")}
                                    </td>
                                    {products.map((product) => {
                                        const val = row.values[product.id] || "—"
                                        const badge = getSpecHighlightBadge(row.name, val)

                                        return (
                                            <td
                                                key={`${product.id}-${row.name}`}
                                                className="p-5 text-center border-l border-line/60 align-middle"
                                            >
                                                {val !== "—" ? (
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className="font-semibold text-small text-ink break-words leading-snug font-mono tabular-nums">
                                                            {val}
                                                        </span>
                                                        {badge && (
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                                    badge.tone === "blue"
                                                                        ? "bg-tech-blue/10 text-tech-blue border-tech-blue/25"
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
                                            key={`empty-spec-${row.name}-${idx}`}
                                            className="p-5 text-center border-l border-line/60 text-ink-faint/40 bg-surface/20"
                                        >
                                            —
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Bottom Purchase Actions Row — Electric Blue (#2563EB) for Add to Cart */}
                            <tr className="bg-surface/50">
                                <td className="sticky left-0 z-10 p-5 font-bold text-small text-ink bg-surface-2 dark:bg-card border-r border-line/80">
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
                                                className="w-full h-11 rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 text-small font-bold shadow-xs"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="w-full rounded-xl border-line text-ink hover:border-tech-blue hover:text-tech-blue text-tiny font-semibold h-9"
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
                                            className="rounded-xl border-dashed border-tech-blue/40 text-tech-blue hover:bg-tech-blue/10 text-tiny font-semibold h-9"
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
