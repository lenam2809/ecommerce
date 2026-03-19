"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { NotificationStats } from "@/components/notifications/notification-stats";
import { CreateNotificationDialog } from "@/components/notifications/create-notification-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Calendar28 } from "@/components/ui/calendar28"; // Giả định component Calendar28 được import
import { toast } from "@/hooks/use-toast";

export default function AdminNotificationsPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    // Trạng thái cho bộ lọc ngày
    const [dateFilters, setDateFilters] = useState<{
        fromDate?: Date;
        toDate?: Date;
    }>({
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Mặc định 30 ngày trước
        toDate: new Date(), // Mặc định hôm nay
    });

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý thông báo</h1>
                    <p className="text-muted-foreground">
                        Quản lý thông báo hệ thống và người dùng, xem thống kê và gửi thông báo.
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo thông báo
                </Button>
            </div>

            {/* Bộ lọc ngày */}
            <div className="flex gap-4">
                <Calendar28
                    selected={dateFilters.fromDate ?? null}
                    onSelect={(date) =>
                        setDateFilters((prev) => ({
                            ...prev,
                            fromDate: date ?? undefined,
                        }))
                    }
                    label="Ngày bắt đầu"
                    id="overview-fromDate"
                />
                <Calendar28
                    selected={dateFilters.toDate ?? null}
                    onSelect={(date) => {
                        if (date && dateFilters.fromDate && date < dateFilters.fromDate) {
                            toast({
                                title: "Lỗi chọn ngày",
                                description: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
                                variant: "destructive",
                            });
                            return;
                        }
                        setDateFilters((prev) => ({
                            ...prev,
                            toDate: date ?? undefined,
                        }));
                    }}
                    label="Ngày kết thúc"
                    id="overview-toDate"
                />
            </div>

            {/* Truyền fromDate và toDate vào NotificationStats */}
            <NotificationStats fromDate={dateFilters.fromDate} toDate={dateFilters.toDate} />

            <Tabs defaultValue="system" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="system">Thông báo hệ thống</TabsTrigger>
                    <TabsTrigger value="user">Thông báo người dùng</TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông báo hệ thống</CardTitle>
                            <CardDescription>Quản lý thông báo toàn hệ thống bao gồm khuyến mãi và cảnh báo bảo trì.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationsList type="system" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="user" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông báo người dùng</CardTitle>
                            <CardDescription>Xem và quản lý thông báo cá nhân của người dùng trên nền tảng.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationsList type="user" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <CreateNotificationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </div>
    );
}