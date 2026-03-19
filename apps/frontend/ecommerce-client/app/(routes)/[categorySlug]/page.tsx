"use client"

import React from "react"
import ProductListing from "@/components/product-listing"

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = React.use(params) // Unwrap params with React.use()

    return (
        <ProductListing
            categorySlug={category}
            backLink={{ href: "/products", label: "Quay lại danh mục" }}
            pageTitle={`Danh mục: ${category}`}
        />
    )
}