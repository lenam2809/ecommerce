import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import ProductReviews from "@/components/product-reviews"
import { SpecGrid } from "./spec-card"

interface ProductTabsProps {
    isLoading: boolean
    productId?: string
    specifications?: { name: string; value: string }[]
    description?: string
    name?: string
    reviewCount?: number
}

export function ProductTabs({
    isLoading,
    productId,
    specifications,
    description,
    reviewCount = 0,
}: ProductTabsProps) {
    if (isLoading) {
        return (
            <div className="mt-16 space-y-4">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
        )
    }

    return (
        <div className="mt-16 sm:mt-24">
            <Tabs defaultValue="description" className="w-full">
                <div className="flex justify-center mb-8 sm:mb-12">
                    <TabsList className="bg-secondary/20 border border-border/50 p-1.5 rounded-2xl shadow-sm glass-card overflow-x-auto overflow-y-hidden max-w-full justify-start sm:justify-center">
                        <TabsTrigger
                            value="description"
                            className="px-6 py-3 rounded-xl tech-heading text-sm sm:text-base data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                        >
                            Mô tả chi tiết
                        </TabsTrigger>
                        <TabsTrigger
                            value="specifications"
                            className="px-6 py-3 rounded-xl tech-heading text-sm sm:text-base data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                        >
                            Thông số kỹ thuật
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            className="px-6 py-3 rounded-xl tech-heading text-sm sm:text-base data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                        >
                            Đánh giá ({reviewCount})
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="description" className="animate-in fade-in-50 duration-500">
                    <div className="glass-card rounded-3xl p-6 sm:p-10 border-border/50 shadow-sm max-w-4xl mx-auto">
                        <h3 className="tech-heading text-2xl mb-6 flex items-center gap-3">
                            <span className="h-6 w-1 rounded-full bg-primary/80"></span>
                            Tính năng nổi bật
                        </h3>
                        <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-[15px] sm:prose-p:text-base">
                            <p>{description}</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="specifications" className="animate-in fade-in-50 duration-500 max-w-5xl mx-auto">
                    <SpecGrid specifications={specifications || []} />
                </TabsContent>
                
                <TabsContent value="reviews" className="animate-in fade-in-50 duration-500">
                    <ProductReviews productId={productId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
