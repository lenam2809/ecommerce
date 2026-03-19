"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { format } from "date-fns"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { CalendarDateRangePicker } from "./date-range-picker"
import { DashboardAnalytics } from "./dashboard-analytics"
import { DashboardReports } from "./dashboard-reports"

export default function Dashboard() {
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
        from: format(new Date().setDate(new Date().getDate() - 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
    });


    const handleDateRangeChange = (range: { from: Date; to: Date }) => {
        setDateRange({
            from: format(range.from, 'yyyy-MM-dd'),
            to: format(range.to, 'yyyy-MM-dd')
        });
    };

    const handleDownload = () => {
    };
    return (
        <DashboardShell>
            <DashboardHeader heading="Dashboard" text="Tổng quan về cửa hàng của bạn">
                <div className="flex items-center gap-2">
                    <CalendarDateRangePicker
                        onChange={handleDateRangeChange}
                        initialDateFrom={new Date(dateRange.from)}
                        initialDateTo={new Date(dateRange.to)}
                    />
                    <Button size="sm" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Tải xuống
                    </Button>
                </div>
            </DashboardHeader>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="analytics">Phân tích</TabsTrigger>
                    <TabsTrigger value="reports">Báo cáo</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <DashboardOverview />
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <DashboardAnalytics />
                </TabsContent>
                <TabsContent value="reports" className="space-y-4">
                    <DashboardReports />
                </TabsContent>
            </Tabs>
        </DashboardShell>
    )
}
