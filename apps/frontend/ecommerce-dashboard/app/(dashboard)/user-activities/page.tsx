"use client"

import { userActivityListConfig } from "@/config/user-activity-list-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Calendar, AlertTriangle } from "lucide-react"
import { ActivityType, UserActivity } from "@/types/user-activity"
import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenericList } from "@/components/generic/generic-list"
import { useGetUserActivities } from "@/hooks/use-user-activities"

interface ActivityStatsProps {
    activities: UserActivity[]
}

const ActivityStats = ({ activities }: ActivityStatsProps) => {
    const stats = useMemo(() => {
        const total = activities.length
        const loginCount = activities.filter(a => a.activityType === ActivityType.Login).length
        const securityAlerts = activities.filter(a => a.activityType === ActivityType.SecurityAlert).length
        const uniqueUsers = new Set(activities.map(a => a.userId)).size

        return {
            total,
            loginCount,
            securityAlerts,
            uniqueUsers
        }
    }, [activities])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng hoạt động</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                        Tổng số hoạt động được ghi nhận
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lượt đăng nhập</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.loginCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Số lần đăng nhập hệ thống
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
                    <p className="text-xs text-muted-foreground">
                        Số người dùng có hoạt động
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cảnh báo bảo mật</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.securityAlerts}</div>
                    <p className="text-xs text-muted-foreground">
                        Số cảnh báo cần chú ý
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

interface RecentActivitiesProps {
    activities: UserActivity[]
}

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
    const recentActivities = activities.slice(0, 5)

    const getActivityTypeColor = (activityType: string) => {
        switch (activityType) {
            case ActivityType.Login:
                return "bg-green-100 text-green-800"
            case ActivityType.SecurityAlert:
                return "bg-red-100 text-red-800"
            case ActivityType.OrderCreated:
                return "bg-blue-100 text-blue-800"
            case ActivityType.AccountLocked:
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
                <CardDescription>5 hoạt động mới nhất của hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                        <div key={activity.id + index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div>
                                    <div className="font-medium text-sm">{activity.userName}</div>
                                    <div className="text-xs text-muted-foreground">{activity.description}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={getActivityTypeColor(activity.activityType)} variant="secondary">
                                    {activity.activityType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(activity.timestamp).toLocaleTimeString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    ))}
                    {recentActivities.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                            Không có hoạt động nào
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function UserActivitiesPage() {
    const [activeTab, setActiveTab] = useState("overview")

    // Lấy dữ liệu hoạt động với limit nhỏ cho overview
    const { data: overviewData } = useGetUserActivities({
        pageSize: 50,
        sortBy: "timestamp",
        isDescending: true
    })

    const activities = overviewData?.data?.items || []

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hoạt động người dùng</h1>
                <p className="text-muted-foreground">
                    Theo dõi và quản lý các hoạt động của người dùng trong hệ thống
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="all-activities">Tất cả hoạt động</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <ActivityStats activities={activities} />
                    <RecentActivities activities={activities} />
                </TabsContent>

                <TabsContent value="all-activities" className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            <GenericList config={userActivityListConfig} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}