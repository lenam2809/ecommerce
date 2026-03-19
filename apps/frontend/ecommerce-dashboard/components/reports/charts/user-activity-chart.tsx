"use client"

import { useUserActivity } from "@/hooks/use-report"
import { UserActivityFilters } from "@/types/report"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface UserActivityChartProps {
    filters?: UserActivityFilters
}

export function UserActivityChart({
    filters = { days: 30 }
}: UserActivityChartProps) {
    const { data, isLoading, error } = useUserActivity(filters)

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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip />
                <Legend />
                {filters.activityType === 'All' || !filters.activityType ? (
                    <>
                        <Line type="monotone" dataKey="logins" stroke="#8884d8" name="Đăng nhập" />
                        <Line type="monotone" dataKey="purchases" stroke="#82ca9d" name="Mua hàng" />
                        <Line type="monotone" dataKey="pageViews" stroke="#ffc658" name="Xem trang" />
                    </>
                ) : (
                    <Line
                        type="monotone"
                        dataKey={filters.activityType.toLowerCase()}
                        stroke={
                            filters.activityType === 'Purchases' ? '#82ca9d' :
                                filters.activityType === 'Logins' ? '#8884d8' : '#ffc658'
                        }
                        name={
                            filters.activityType === 'Purchases' ? 'Mua hàng' :
                                filters.activityType === 'Logins' ? 'Đăng nhập' : 'Xem trang'
                        }
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    )
}