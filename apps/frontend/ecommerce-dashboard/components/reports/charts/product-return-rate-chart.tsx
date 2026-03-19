"use client"

import { useProductReturnRate } from "@/hooks/use-report"
import { ProductReturnRateFilters } from "@/types/report"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductReturnRateChartProps {
    filters?: ProductReturnRateFilters
}

export function ProductReturnRateChart({
    filters = { topN: 8 }
}: ProductReturnRateChartProps) {
    const { data, isLoading, error } = useProductReturnRate(filters)

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
        rate: item.returnRate
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
                    tickFormatter={(value) => `${value}%`}
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
                <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ hoàn trả"]} />
                <Bar dataKey="rate" fill="#ff8042" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}