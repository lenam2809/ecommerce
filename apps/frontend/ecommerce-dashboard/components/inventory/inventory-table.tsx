"use client"

import { InventoryItem, getInventoryStatusName, getInventoryStatusColor } from "@/types/inventory"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InventoryTableProps {
    items: InventoryItem[]
}

export function InventoryTable({ items }: InventoryTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">
                    Danh sách IMEI/Serial ({items.length} mục)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Serial Number</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Batch Code</TableHead>
                            <TableHead>Ngày nhập</TableHead>
                            <TableHead>Ghi chú</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                                <TableCell className="font-mono text-sm">{item.skuCode}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getInventoryStatusColor(item.status)}`}>
                                        {getInventoryStatusName(item.status)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{item.batchCode || "—"}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(item.importedAt).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{item.notes || "—"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
