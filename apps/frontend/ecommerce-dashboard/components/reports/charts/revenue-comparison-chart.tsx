"use client"

import { useRevenueComparison } from "@/hooks/use-report"
import { RevenueComparisonFilters } from "@/types/report"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND } from "@/lib/utils/currency"

interface RevenueComparisonChartProps {
    filters: RevenueComparisonFilters
}

export function RevenueComparisonChart({ filters }: RevenueComparisonChartProps) {
    const { data: apiResponse, isLoading, error } = useRevenueComparison(filters)
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
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${formatVND(value)}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(value) => [`${formatVND(value as number)}`, "Doanh thu"]} labelFormatter={(label) => `Tháng: ${label}`} />
                <Legend />
                <Bar dataKey="current" name="Giai đoạn hiện tại" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" name="Giai đoạn trước" fill="#888888" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}