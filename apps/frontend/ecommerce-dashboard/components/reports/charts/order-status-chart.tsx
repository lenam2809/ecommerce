"use client"

import { useOrderStatus } from "@/hooks/use-report"
import { OrderStatusFilters } from "@/types/report"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderStatusChartProps {
    filters?: OrderStatusFilters
}

const COLORS = ["#adfa1d", "#82ca9d", "#8884d8", "#ff8042", "#ff0000"]

export function OrderStatusChart({
    filters = {}
}: OrderStatusChartProps) {
    const { data, isLoading, error } = useOrderStatus(filters)

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
                    data={data?.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                >
                    {data?.data?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, "Số lượng đơn hàng"]} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}