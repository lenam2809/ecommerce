"use client"

import { useRevenueTrend } from "@/hooks/use-report"
import { RevenueTrendFilters } from "@/types/report"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND } from "@/lib/utils/currency"

interface RevenueTrendChartProps {
    filters: RevenueTrendFilters
}

export function RevenueTrendChart({ filters }: RevenueTrendChartProps) {
    const { data, isLoading, error } = useRevenueTrend(filters)

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
            <LineChart data={data?.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${formatVND(value)}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(value) => [`${formatVND(value as any)}`, "Doanh thu"]} labelFormatter={(label) => `${label}`} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                <Line type="monotone" dataKey="revenue" stroke="#adfa1d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}