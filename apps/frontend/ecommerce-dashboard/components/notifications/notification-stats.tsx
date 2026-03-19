"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStatistics } from "@/hooks/use-notifications";
import { Bell, Users, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface NotificationStatsProps {
    fromDate?: Date;
    toDate?: Date;
}

export function NotificationStats({ fromDate, toDate }: NotificationStatsProps) {
    // Memoize params để đảm bảo query key ổn định
    const statsParams = useMemo(
        () => ({
            fromDate: fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)).toISOString() : undefined,
            toDate: toDate ? new Date(toDate.setHours(23, 59, 59, 999)).toISOString() : undefined,
        }),
        [fromDate, toDate] // Chỉ cập nhật khi fromDate hoặc toDate thay đổi
    );

    const { data: stats, isLoading } = useGetStatistics(statsParams);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Đang tải...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-6 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const readRate = stats?.totalNotifications
        ? Math.round((stats.readNotifications / stats.totalNotifications) * 100)
        : 0;

    const statsData = [
        {
            title: "Tổng thông báo",
            value: stats?.totalNotifications || 0,
            description: "Tất cả thông báo đã gửi",
            icon: Bell,
            color: "text-blue-600",
        },
        {
            title: "Đã đọc",
            value: stats?.readNotifications || 0,
            description: "Thông báo đã được đọc",
            icon: CheckCircle,
            color: "text-green-600",
        },
        {
            title: "Chưa đọc",
            value: stats?.unreadNotifications || 0,
            description: "Thông báo chưa đọc",
            icon: AlertTriangle,
            color: "text-orange-600",
        },
        {
            title: "Đã hết hạn",
            value: stats?.expiredNotifications || 0,
            description: "Thông báo hết hạn",
            icon: Users,
            color: "text-red-600",
        },
        {
            title: "Tỷ lệ đọc",
            value: `${readRate}%`,
            description: "Tỷ lệ thông báo được đọc",
            icon: TrendingUp,
            color: "text-emerald-600",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}