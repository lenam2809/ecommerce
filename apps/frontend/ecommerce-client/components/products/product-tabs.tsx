import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import ProductReviews from "@/components/product-reviews"
import { SpecGrid } from "./spec-card"
import { FileText, Sliders, MessageSquare, ShieldCheck } from "lucide-react"

interface ProductTabsProps {
    isLoading: boolean
    productId?: string
    specifications?: { name: string; value: string }[]
    description?: string
    name?: string
    reviewCount?: number
}

/**
 * ProductTabs — Hybrid Premium Tech (SSoT 2026)
 * Tabs with Electric Blue (#2563EB) underline active state, 14-row Zebra-striped specs, and SignalR realtime reviews
 */
export function ProductTabs({
    isLoading,
    productId,
    specifications,
    description,
    name,
    reviewCount = 128,
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
                    className="shrink-0 pb-3.5 pt-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-small font-bold text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                    <Sliders className="h-4 w-4" />
                    <span>Thông số kỹ thuật (14)</span>
                </TabsTrigger>

                <TabsTrigger
                    value="description"
                    className="shrink-0 pb-3.5 pt-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-small font-bold text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                    <FileText className="h-4 w-4" />
                    <span>Đánh giá chuyên sâu</span>
                </TabsTrigger>

                <TabsTrigger
                    value="reviews"
                    className="shrink-0 pb-3.5 pt-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none text-small font-bold text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-2 cursor-pointer tabular-nums"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>Đánh giá & Nhận xét ({reviewCount || 128})</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="pt-8 focus-visible:outline-none">
                <SpecGrid specifications={specifications || []} />
            </TabsContent>

            <TabsContent value="description" className="pt-8 max-w-4xl focus-visible:outline-none">
                <div className="p-6 sm:p-8 rounded-3xl bg-card border border-line space-y-4 text-body text-ink-soft leading-relaxed">
                    <h3 className="text-h3 font-bold text-ink">
                        {name || "MacBook Pro 14 M3 Pro (36GB/1TB)"} — Đỉnh cao hiệu năng Đồ họa & AI 2026
                    </h3>
                    <p>
                        {description ||
                            "Trang bị vi xử lý Apple M3 Pro tiến trình 3nm tiên tiến cùng 36GB RAM hợp nhất (Unified Memory) và ổ cứng 1TB SSD tốc độ cao, thiết bị mang lại khả năng xử lý mượt mà mọi tác vụ dựng phim 8K ProRes, biên dịch mã nguồn lớn và mô hình AI cục bộ."}
                    </p>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-small text-ink">
                            <strong>Cam kết chính hãng ShopViet:</strong> Sản phẩm phân phối chính thức chuẩn VN/A, nguyên seal từ nhà sản xuất, hưởng đặc quyền{" "}
                            <strong>12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)</strong> tại toàn bộ <strong>45 Showroom</strong> trên toàn quốc.
                        </p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-8 focus-visible:outline-none">
                <ProductReviews productId={productId} />
            </TabsContent>
        </Tabs>
    )
}
