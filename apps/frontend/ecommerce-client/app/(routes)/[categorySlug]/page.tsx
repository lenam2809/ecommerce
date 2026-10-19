"use client"

import React from "react"
import ProductListing from "@/components/product-listing"

interface CategoryPageProps {
    params: Promise<{
        categorySlug?: string
        category?: string
    }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
    const resolvedParams = React.use(params)
    const categorySlug = resolvedParams.categorySlug || resolvedParams.category || ""

    return (
        <ProductListing
            categorySlug={categorySlug}
            backLink={{ href: "/products", label: "Quay lại danh mục" }}
        />
    )
}