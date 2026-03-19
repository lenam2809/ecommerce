"use client"

import { useAverageOrderValue } from "@/hooks/use-report";
import { formatVND } from "@/lib/utils/currency";
import { AverageOrderValueFilters } from "@/types/report";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AverageOrderValueChartProps {
    filters?: AverageOrderValueFilters;
}

export function AverageOrderValueChart({
    filters = { monthsCount: 12 }
}: AverageOrderValueChartProps) {
    const { data, isLoading, error } = useAverageOrderValue(filters);

    if (isLoading) return <div className="flex justify-center items-center h-[350px]">Đang tải...</div>;
    if (error) return <div className="flex justify-center items-center h-[350px]">Lỗi khi tải dữ liệu</div>;

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
                <Tooltip
                    formatter={(value) => [`${formatVND(value as number)}`, "Giá trị đơn hàng trung bình"]}
                    labelFormatter={(label) => `Tháng: ${label}`}
                />
                <Line type="monotone" dataKey="aov" stroke="#adfa1d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}
