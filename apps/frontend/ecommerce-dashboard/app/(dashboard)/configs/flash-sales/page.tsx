"use client"

import { useState } from "react"
import Link from "next/link"
import { useGetFlashSales } from "@/hooks/use-flash-sales"
import { FlashSaleTable } from "@/components/flash-sales/flash-sale-table"
import { getFlashSaleStatus } from "@/types/flash-sale"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    IconBolt,
    IconPlus,
    IconRefresh,
} from "@tabler/icons-react"

export default function FlashSalesPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const { data: result, isLoading, refetch, isRefetching } = useGetFlashSales()
    const flashSales = result?.data || []

    const filteredSales = flashSales.filter((sale) => {
        if (statusFilter === "all") return true
        const status = getFlashSaleStatus(sale)
        return status === statusFilter
    })

    const ongoingCount = flashSales.filter((s) => getFlashSaleStatus(s) === "ongoing").length
    const upcomingCount = flashSales.filter((s) => getFlashSaleStatus(s) === "upcoming").length
    const endedCount = flashSales.filter((s) => getFlashSaleStatus(s) === "ended").length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <IconBolt className="h-7 w-7 text-brand" />
                        Quản lý Chiến dịch Flash Sale
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Cấu hình các khung giờ vàng mở bán sản phẩm công nghệ giá sốc theo chuẩn SSoT 2026
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isLoading || isRefetching}
                        className="h-9 w-9"
                    >
                        <IconRefresh className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                    </Button>

                    <Button asChild className="bg-brand hover:bg-brand/90 text-white font-medium">
                        <Link href="/configs/flash-sales/new">
                            <IconPlus className="mr-2 h-4 w-4" /> Tạo chiến dịch mới
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                    <TabsList className="bg-surface/50 border">
                        <TabsTrigger value="all" className="text-xs">
                            Tất cả ({flashSales.length})
                        </TabsTrigger>
                        <TabsTrigger value="ongoing" className="text-xs text-brand data-[state=active]:text-brand">
                            Đang diễn ra ({ongoingCount})
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="text-xs text-tech-blue data-[state=active]:text-tech-blue">
                            Sắp diễn ra ({upcomingCount})
                        </TabsTrigger>
                        <TabsTrigger value="ended" className="text-xs">
                            Đã kết thúc ({endedCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Table */}
            <FlashSaleTable flashSales={filteredSales} isLoading={isLoading} />
        </div>
    )
}
