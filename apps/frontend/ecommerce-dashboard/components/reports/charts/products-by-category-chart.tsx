"use client"

import { useProductsByCategory } from "@/hooks/use-report"
import { ProductsByCategoryFilters } from "@/types/report"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#adfa1d", "#82ca9d", "#8884d8", "#ffc658", "#ff8042", "#0088fe"]

interface ProductsByCategoryChartProps {
    filters?: ProductsByCategoryFilters
}

export function ProductsByCategoryChart({
    filters = {}
}: ProductsByCategoryChartProps) {
    const { data, isLoading, error } = useProductsByCategory(filters)

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
        value: item.percentage
    }))

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {chartData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ phần trăm"]} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}