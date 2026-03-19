"use client"

import { useTopUsers } from "@/hooks/use-report"
import { TopUsersFilters } from "@/types/report"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND } from "@/lib/utils/currency"

interface TopUsersChartProps {
    filters?: TopUsersFilters
}

export function TopUsersChart({
    filters = { topN: 10, orderBy: "TotalSpent" }
}: TopUsersChartProps) {
    const { data, isLoading, error } = useTopUsers(filters)

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
        name: `${item.firstName} ${item.lastName}`,
        value: filters.orderBy === 'TotalSpent' ? item.totalSpent :
            filters.orderBy === 'OrderCount' ? item.orderCount :
                new Date(item.lastActivity).getTime()
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
                    tickFormatter={(value) =>
                        filters.orderBy === 'TotalSpent' ? `${formatVND(value)}` :
                            filters.orderBy === 'OrderCount' ? `${value}` :
                                new Date(value).toLocaleDateString()
                    }
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
                <Tooltip
                    formatter={(value) => [
                        filters.orderBy === 'TotalSpent' ? `${formatVND(value as number)}` :
                            filters.orderBy === 'OrderCount' ? `${value} đơn hàng` :
                                new Date(value as number).toLocaleString(),
                        filters.orderBy === 'TotalSpent' ? 'Tổng chi tiêu' :
                            filters.orderBy === 'OrderCount' ? 'Số đơn hàng' :
                                'Hoạt động cuối'
                    ]}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}