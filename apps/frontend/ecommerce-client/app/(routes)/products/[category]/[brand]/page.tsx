"use client"

import React from "react"
import ProductListing from "@/components/product-listing"
import { useCategoryBySlug } from "@/hooks/use-categories"

export default function BrandPage({ params }: { params: Promise<{ category: string; brand: string }> }) {
    const { category, brand } = React.use(params) // Unwrap params with React.use()
    const { data: categoryData } = useCategoryBySlug(category)

    return (
        <ProductListing
            categorySlug={category}
            brandSlug={brand}
            backLink={{
                href: `/products/${category}`,
                label: `Quay lại ${categoryData?.name || "danh mục"}`,
            }}
        />
    )
}