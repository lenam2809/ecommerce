import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Activity,
    Clock,
    MapPin,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from "lucide-react";
import { useGetActivitiesByUser } from "@/hooks/use-user-activities";
import { User } from "@/types/user";
import { ActivityType, UserActivity } from "@/types/user-activity";
import { SingleSelect } from '../ui/select/single-select';
import { formatDateTime } from '@/lib/utils/currency';

interface UserActivityDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Activity type mapping to Vietnamese
const activityTypeLabels: Record<ActivityType, string> = {
    [ActivityType.Login]: "Đăng nhập",
    [ActivityType.Logout]: "Đăng xuất",
    [ActivityType.Register]: "Đăng ký",
    [ActivityType.PasswordChange]: "Đổi mật khẩu",
    [ActivityType.ProfileUpdate]: "Cập nhật hồ sơ",
    [ActivityType.OrderCreated]: "Tạo đơn hàng",
    [ActivityType.OrderUpdated]: "Cập nhật đơn hàng",
    [ActivityType.OrderCancelled]: "Hủy đơn hàng",
    [ActivityType.AccountLocked]: "Khóa tài khoản",
    [ActivityType.AccountUnlocked]: "Mở khóa tài khoản",
    [ActivityType.PermissionChanged]: "Thay đổi quyền",
    [ActivityType.DataExport]: "Xuất dữ liệu",
    [ActivityType.SecurityAlert]: "Cảnh báo bảo mật",
};

// Activity type badge variants
const getActivityTypeBadgeVariant = (type: ActivityType): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
        case ActivityType.Login:
        case ActivityType.Register:
        case ActivityType.OrderCreated:
            return "default";
        case ActivityType.Logout:
        case ActivityType.ProfileUpdate:
        case ActivityType.OrderUpdated:
            return "secondary";
        case ActivityType.AccountLocked:
        case ActivityType.OrderCancelled:
        case ActivityType.SecurityAlert:
            return "destructive";
        case ActivityType.AccountUnlocked:
        case ActivityType.PermissionChanged:
        case ActivityType.DataExport:
            return "outline";
        default:
            return "outline";
    }
};

export function UserActivityDialog({ user, open, onOpenChange }: UserActivityDialogProps) {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [activityType, setActivityType] = useState<string>("");
    const [sortBy] = useState("timestamp");
    const [isDescending] = useState(true);

    const {
        data: activitiesData,
        isLoading,
        error,
        refetch
    } = useGetActivitiesByUser(user.id, {
        pageNumber,
        pageSize,
        searchTerm: searchTerm || undefined,
        activityType: activityType || undefined,
        sortBy,
        isDescending,
    });

    const activities = activitiesData?.data?.items || [];
    const totalCount = activitiesData?.data?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPageNumber(1); // Reset to first page when searching
    };

    const handleActivityTypeFilter = (value: string | null) => {
        setActivityType(value || "");
        setPageNumber(1); // Reset to first page when filtering
    };

    const handlePageSizeChange = (value: string | null) => {
        setPageSize(parseInt(value || "10"));
        setPageNumber(1); // Reset to first page when changing page size
    };

    // Prepare activity type options
    const activityTypeOptions = Object.entries(activityTypeLabels).map(([value, label]) => ({
        value,
        label,
    }));

    // Prepare page size options
    const pageSizeOptions = [
        { value: "5", label: "5 dòng" },
        { value: "10", label: "10 dòng" },
        { value: "20", label: "20 dòng" },
        { value: "50", label: "50 dòng" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[60vw] max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Hoạt động của người dùng
                    </DialogTitle>
                    <DialogDescription>
                        Xem lịch sử hoạt động của {user.lastName}  {user.firstName} ({user.email})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* User Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Thông tin người dùng</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Họ tên:</span>
                                    <p className="font-medium">{user.lastName} {user.firstName}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Số điện thoại:</span>
                                    <p className="font-medium">{user.phoneNumber || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Trạng thái: </span>
                                    <Badge variant="default" className="mt-1">{user.status}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm kiếm theo mô tả..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <SingleSelect
                                    options={[
                                        { value: "", label: "Tất cả hoạt động" },
                                        ...activityTypeOptions
                                    ]}
                                    value={activityType}
                                    onChange={handleActivityTypeFilter}
                                    placeholder="Loại hoạt động"
                                    searchable
                                    clearable
                                    triggerClassName="w-full sm:w-[200px]"
                                    renderOption={(option) => (
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <span>{option.label}</span>
                                        </div>
                                    )}
                                    renderValue={(option) => (
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <span>{option?.label || "Loại hoạt động"}</span>
                                        </div>
                                    )}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => refetch()}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activities Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    Lịch sử hoạt động ({totalCount} hoạt động)
                                </CardTitle>
                                <SingleSelect
                                    options={pageSizeOptions}
                                    value={pageSize.toString()}
                                    onChange={handlePageSizeChange}
                                    placeholder="Số dòng"
                                    triggerClassName="w-[10vw]"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                                        <span>Đang tải...</span>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center h-32 text-destructive">
                                        <span>Có lỗi xảy ra khi tải dữ liệu</span>
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                                        <span>Không có hoạt động nào</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[120px]">Thời gian</TableHead>
                                                <TableHead className="w-[140px]">Loại hoạt động</TableHead>
                                                <TableHead>Mô tả</TableHead>
                                                <TableHead className="w-[120px]">IP Address</TableHead>
                                                <TableHead className="w-[100px]">Vị trí</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activities.map((activity: UserActivity) => (
                                                <TableRow key={activity.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatDateTime(activity.timestamp)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getActivityTypeBadgeVariant(activity.activityType as ActivityType)}
                                                            className="text-xs"
                                                        >
                                                            {activityTypeLabels[activity.activityType as ActivityType] || activity.activityType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-[300px] truncate" title={activity.description}>
                                                            {activity.description}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                            {activity.ipAddress}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate" title={activity.location}>
                                                                {activity.location || "N/A"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </ScrollArea>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Hiển thị {((pageNumber - 1) * pageSize) + 1} - {Math.min(pageNumber * pageSize, totalCount)} của {totalCount} hoạt động
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                                disabled={pageNumber <= 1 || isLoading}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Trước
                                            </Button>
                                            <span className="text-sm">
                                                Trang {pageNumber} / {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                                                disabled={pageNumber >= totalPages || isLoading}
                                            >
                                                Sau
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}