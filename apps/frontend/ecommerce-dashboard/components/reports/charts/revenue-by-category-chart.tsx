"use client"

import { useRevenueByCategory } from "@/hooks/use-report"
import { RevenueByCategoryFilters } from "@/types/report"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND } from "@/lib/utils/currency"

const COLORS = ["#adfa1d", "#82ca9d", "#8884d8", "#ffc658", "#ff8042", "#0088fe"]

interface RevenueByCategoryChartProps {
    filters: RevenueByCategoryFilters
}

export function RevenueByCategoryChart({ filters }: RevenueByCategoryChartProps) {
    const { data: apiResponse, isLoading, error } = useRevenueByCategory(filters)
    const data = apiResponse?.data || []

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

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, label) => [`${formatVND(value as number)}`, label]} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}