"use client"

import { useOrderRatio } from "@/hooks/use-report"
import { OrderRatioFilters } from "@/types/report"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderRatioChartProps {
    filters?: OrderRatioFilters
}

export function OrderRatioChart({
    filters = { monthsCount: 6 }
}: OrderRatioChartProps) {
    const { data, isLoading, error } = useOrderRatio(filters)

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
            <BarChart data={data?.data} stackOffset="expand" layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <Tooltip formatter={(value) => [`${value}%`, ""]} labelFormatter={(label) => `Tháng: ${label}`} />
                <Legend />
                <Bar dataKey="success" name="Đơn hàng thành công" stackId="a" fill="#adfa1d" />
                <Bar dataKey="cancel" name="Đơn hàng đã hủy" stackId="a" fill="#ff8042" />
            </BarChart>
        </ResponsiveContainer>
    )
}