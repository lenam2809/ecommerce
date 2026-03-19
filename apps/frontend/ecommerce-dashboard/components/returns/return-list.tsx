"use client"

import { ReturnRequestList, getReturnStatusName, getReturnStatusColor, getReturnTypeName } from "@/types/return-request"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ReturnListProps {
    items: ReturnRequestList[]
    loading: boolean
}

export function ReturnList({ items, loading }: ReturnListProps) {
    const router = useRouter()

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground">Không có yêu cầu đổi/trả nào.</p>
            </div>
        )
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã yêu cầu</TableHead>
                            <TableHead>Mã đơn hàng</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">SL</TableHead>
                            <TableHead className="text-right">Số tiền</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow
                                key={item.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => router.push(`/returns/${item.id}`)}
                            >
                                <TableCell className="font-mono font-medium text-sm">{item.code}</TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">{item.orderCode}</TableCell>
                                <TableCell>{item.customerName}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{getReturnTypeName(item.type)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getReturnStatusColor(item.status)}`}>
                                        {getReturnStatusName(item.status)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(item.refundAmount)}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
