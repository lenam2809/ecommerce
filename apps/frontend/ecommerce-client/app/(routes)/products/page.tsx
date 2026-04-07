"use client"

import React, { Suspense } from "react"
import ProductListing from "@/components/product-listing"

export default function ProductsPage() {
  // No params to unwrap since this is the base /products route
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <ProductListing />
    </Suspense>
  )
}