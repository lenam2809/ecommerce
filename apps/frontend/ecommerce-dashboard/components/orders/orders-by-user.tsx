"use client";

import { logger } from '@/lib/logger'
import React, { useEffect } from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    ShoppingCart,
    Loader2,
    Package
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetOrdersByUser } from "@/hooks/use-users";
import { getStatusBadgeVariant, getStatusName } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { formatDateDDMMYYYY, formatVND } from '@/lib/utils/currency';
import { User } from "@/types/user";

interface OrdersByUserDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const OrdersByUserDialog: React.FC<OrdersByUserDialogProps> = ({
    user,
    open,
    onOpenChange,
}) => {
    const router = useRouter();
    const { toast } = useToast();
    const { data: ordersResult, isLoading, error } = useGetOrdersByUser(user.id);

    const ordersData = ordersResult?.data || [];

    const handleOpenChange = (open: boolean) => {
        logger.debug("Orders dialog open state:", open);
        if (!open) {
            // Đặt lại pointer-events và thêm timeout để đảm bảo
            document.body.style.pointerEvents = "auto";
            setTimeout(() => {
                document.body.style.pointerEvents = "auto";
                logger.debug("Forced pointer-events reset:", document.body.style.pointerEvents);
            }, 100);
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }
        onOpenChange(open);
    };

    useEffect(() => {
        if (open) {
            // Đảm bảo pointer-events là auto khi dialog mở
            document.body.style.pointerEvents = "auto";
            logger.debug("Orders dialog opened, pointer-events:", document.body.style.pointerEvents);
        }
        return () => {
            // Cleanup khi unmount
            document.body.style.pointerEvents = "auto";
            logger.debug("Cleaning up OrdersByUserDialog, pointer-events:", document.body.style.pointerEvents);
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="!max-w-6xl max-h-[80vh]" forceMount>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Đơn hàng của khách hàng: {user.fullName}
                    </DialogTitle>
                    <DialogDescription className="mb-4">
                        Xem và quản lý đơn hàng của khách hàng {user.fullName} ({user.email})
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Đang tải danh sách đơn hàng...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 text-red-500">
                        Có lỗi xảy ra khi tải danh sách đơn hàng. Vui lòng thử lại sau.
                    </div>
                )}

                {ordersResult?.success && (
                    <ScrollArea className="h-[500px] pr-4">
                        {!ordersData?.length ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                Không tìm thấy đơn hàng nào.
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã đơn hàng</TableHead>
                                            <TableHead>Ngày đặt</TableHead>
                                            <TableHead>Sản phẩm</TableHead>
                                            <TableHead>Tổng tiền</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ordersData.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.code}</TableCell>
                                                <TableCell>
                                                    {formatDateDDMMYYYY(order.orderDate)}
                                                </TableCell>
                                                <TableCell>
                                                    {order.orderItems.length} sản phẩm
                                                </TableCell>
                                                <TableCell>
                                                    {formatVND(order.totalAmount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(order.status)}>
                                                        {getStatusName(order.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => router.push(`/orders/${order.id}`)}
                                                            >
                                                                Xem chi tiết
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(order.code);
                                                                    toast({
                                                                        title: "Đã sao chép mã đơn hàng",
                                                                        description: `Mã đơn hàng ${order.code} đã được sao chép`,
                                                                    });
                                                                }}
                                                            >
                                                                Sao chép mã đơn
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    toast({
                                                                        title: "Hỗ trợ đơn hàng",
                                                                        description: `Yêu cầu hỗ trợ cho đơn hàng ${order.code}`,
                                                                    });
                                                                }}
                                                            >
                                                                Yêu cầu hỗ trợ
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};
