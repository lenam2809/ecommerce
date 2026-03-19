"use client"

import { useTopProducts } from "@/hooks/use-report"
import { TopProductsFilters } from "@/types/report"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND } from "@/lib/utils/currency"

interface TopProductsChartProps {
    filters?: TopProductsFilters
}

export function TopProductsChart({
    filters = { topN: 10, orderBy: "Revenue" }
}: TopProductsChartProps) {
    const { data, isLoading, error } = useTopProducts(filters)

    if (isLoading) return (
        <div className="flex justify-center items-center h-[350px]">
            <div className="space-y-4 w-full">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-1/3 mx-auto" />
            </div>
        </div>
    )

    if (error) return <div className="flex justify-center items-center h-[350px]">Lỗi khi tải dữ liệu</div>

    const chartData = data?.data?.map(item => ({
        name: item.name,
        revenue: item.revenue
    }))

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${formatVND(value)}`}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={150}
                />
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <Tooltip formatter={(value) => [`${formatVND(value as number)}`, "Doanh thu"]} />
                <Bar dataKey="revenue" fill="#adfa1d" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}