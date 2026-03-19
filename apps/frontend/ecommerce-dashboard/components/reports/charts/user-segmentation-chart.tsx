"use client"

import { useUserSegmentation } from "@/hooks/use-report"
import { UserSegmentationFilters } from "@/types/report"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#0088fe", "#00c49f", "#ffbb28", "#ff8042", "#8884d8", "#82ca9d"]

interface UserSegmentationChartProps {
    filters?: UserSegmentationFilters
}

export function UserSegmentationChart({
    filters = {}
}: UserSegmentationChartProps) {
    const { data, isLoading, error } = useUserSegmentation(filters)

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
        name: item.segment,
        value: item.count
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
                <Tooltip formatter={(value) => [`${value} người dùng`, "Số lượng"]} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}