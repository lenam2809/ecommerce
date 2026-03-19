import React, { useState } from 'react';
import {
    useGetOrderHistory,
} from '@/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package } from 'lucide-react';
import { OrderChangeType } from '@/types/order';

// Component hiển thị lịch sử của một đơn hàng cụ thể
export const OrderHistoryComponent: React.FC<{ orderId: string }> = ({ orderId }) => {
    const [currentPage] = useState(1);
    const pageSize = 10;

    const { data: historyResult, isLoading, error } = useGetOrderHistory({
        orderId,
        pageNumber: currentPage,
        pageSize
    });

    if (isLoading) return <div>Đang tải lịch sử đơn hàng...</div>;
    if (error) return <div>Lỗi khi tải lịch sử đơn hàng</div>;
    if (!historyResult?.success) return <div>Không thể tải lịch sử đơn hàng</div>;

    const history = historyResult.data;

    const getChangeTypeBadgeVariant = (changeType: string) => {
        switch (changeType) {
            case OrderChangeType.STATUS_CHANGE:
                return 'default';
            case OrderChangeType.AMOUNT_CHANGE:
                return 'destructive';
            case OrderChangeType.ADDRESS_CHANGE:
                return 'secondary';
            case OrderChangeType.DELIVERY_DATE_CHANGE:
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getChangeTypeText = (changeType: string) => {
        switch (changeType) {
            case OrderChangeType.STATUS_CHANGE:
                return 'Thay đổi trạng thái';
            case OrderChangeType.AMOUNT_CHANGE:
                return 'Thay đổi số tiền';
            case OrderChangeType.ADDRESS_CHANGE:
                return 'Thay đổi địa chỉ';
            case OrderChangeType.DELIVERY_DATE_CHANGE:
                return 'Thay đổi ngày giao';
            default:
                return 'Thay đổi khác';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Lịch sử đơn hàng
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {history?.map((item) => (
                        <div key={item.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{item.statusChangeDescription}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(item.changedAt).toLocaleString('vi-VN')}
                                        <span>•</span>
                                        <span>Bởi: {item.changedBy}</span>
                                        <span>•</span>
                                        <span>Nguồn: {item.changeSource}</span>
                                    </div>
                                </div>
                                <Badge variant={getChangeTypeBadgeVariant(item.changeType)}>
                                    {getChangeTypeText(item.changeType)}
                                </Badge>
                            </div>

                            {/* Hiển thị các thay đổi cụ thể */}
                            <div className="mt-3 text-xs space-y-1">
                                {item.hasAmountChange && (
                                    <div className="flex justify-between">
                                        <span>Số tiền:</span>
                                        <span>
                                            {item.previousTotalAmount?.toLocaleString('vi-VN')}₫
                                            → {item.newTotalAmount?.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                )}
                                {item.hasAddressChange && (
                                    <div className="flex justify-between">
                                        <span>Địa chỉ:</span>
                                        <span className="text-right max-w-xs">
                                            {item.previousShippingAddress} → {item.newShippingAddress}
                                        </span>
                                    </div>
                                )}
                                {item.hasDeliveryDateChange && (
                                    <div className="flex justify-between">
                                        <span>Ngày giao:</span>
                                        <span>
                                            {item.previousExpectedDeliveryDate && new Date(item.previousExpectedDeliveryDate).toLocaleDateString('vi-VN')}
                                            → {item.newExpectedDeliveryDate && new Date(item.newExpectedDeliveryDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


