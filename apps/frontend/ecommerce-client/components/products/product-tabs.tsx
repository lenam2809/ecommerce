import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import ProductReviews from "@/components/product-reviews"
import { SpecGrid } from "./spec-card"
import { FileText, Sliders, MessageSquare } from "lucide-react"

interface ProductTabsProps {
    isLoading: boolean
    productId?: string
    specifications?: { name: string; value: string }[]
    description?: string
    name?: string
    reviewCount?: number
}

/**
 * ProductTabs — Editorial Tech Minimalism
 * Tabs with underline active state, icon indicators, and clean spacing
 */
export function ProductTabs({
    isLoading,
    productId,
    specifications,
    description,
    reviewCount = 0,
}: ProductTabsProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full max-w-md rounded-xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        )
    }

    return (
        <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="flex w-full justify-start gap-6 sm:gap-10 overflow-x-auto border-b border-line bg-transparent h-auto p-0 rounded-none scrollbar-hide">
                <TabsTrigger
                    value="specifications"
                    className="shrink-0 pb-3.5 pt-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none text-small font-semibold text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                    <Sliders className="h-4 w-4" />
                    <span>Thông số kỹ thuật</span>
                </TabsTrigger>

                <TabsTrigger
                    value="description"
                    className="shrink-0 pb-3.5 pt-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none text-small font-semibold text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                    <FileText className="h-4 w-4" />
                    <span>Mô tả chi tiết</span>
                </TabsTrigger>

                <TabsTrigger
                    value="reviews"
                    className="shrink-0 pb-3.5 pt-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none text-small font-semibold text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>Đánh giá ({reviewCount})</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="pt-8 focus-visible:outline-none">
                <SpecGrid specifications={specifications || []} />
            </TabsContent>

            <TabsContent value="description" className="pt-8 max-w-3xl focus-visible:outline-none">
                <div className="prose prose-zinc dark:prose-invert max-w-none text-body text-ink-soft leading-relaxed space-y-4">
                    <p>{description || "Sản phẩm công nghệ cao cấp chính hãng được phân phối và bảo hành bởi ShopViet."}</p>
                </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-8 focus-visible:outline-none">
                <ProductReviews productId={productId} />
            </TabsContent>
        </Tabs>
    )
}
