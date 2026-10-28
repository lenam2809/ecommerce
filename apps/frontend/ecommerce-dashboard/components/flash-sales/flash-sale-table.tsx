"use client"

import { useState } from "react"
import Link from "next/link"
import { FlashSale, getFlashSaleStatus, getFlashSaleStatusBadge } from "@/types/flash-sale"
import { useDeleteFlashSale } from "@/hooks/use-flash-sales"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    IconEdit,
    IconTrash,
    IconBolt,
    IconStar,
    IconCalendarTime,
} from "@tabler/icons-react"

interface FlashSaleTableProps {
    flashSales: FlashSale[]
    isLoading?: boolean
}

export function FlashSaleTable({ flashSales, isLoading }: FlashSaleTableProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const deleteMutation = useDeleteFlashSale()

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleDelete = async () => {
        if (!deleteId) return
        await deleteMutation.mutateAsync(deleteId)
        setDeleteId(null)
    }

    if (isLoading) {
        return (
            <div className="py-24 text-center text-muted-foreground text-sm">
                Đang tải danh sách chiến dịch Flash Sale...
            </div>
        )
    }

    if (flashSales.length === 0) {
        return (
            <div className="py-20 text-center space-y-3 rounded-lg border border-dashed p-8">
                <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                    <IconBolt className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Chưa có chiến dịch Flash Sale nào</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Tạo chiến dịch Flash Sale mới để mở bán các sản phẩm công nghệ giá sốc theo khung giờ vàng.
                </p>
                <Button asChild className="bg-brand hover:bg-brand/90 text-white mt-2">
                    <Link href="/configs/flash-sales/new">
                        <IconBolt className="mr-2 h-4 w-4" /> Tạo chiến dịch Flash Sale đầu tiên
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-surface/50">
                        <TableHead className="w-[280px]">Chiến dịch Flash Sale</TableHead>
                        <TableHead className="w-[220px]">Khung giờ mở bán</TableHead>
                        <TableHead className="w-[140px]">Trạng thái</TableHead>
                        <TableHead className="w-[140px]">Quy mô sản phẩm</TableHead>
                        <TableHead>Tiến độ bán hàng (SSoT)</TableHead>
                        <TableHead className="text-right w-[120px]">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flashSales.map((sale) => {
                        const statusKey = getFlashSaleStatus(sale)
                        const statusBadge = getFlashSaleStatusBadge(statusKey)

                        // Tính tổng quota và số lượng đã bán
                        const totalQuota = sale.items?.reduce((acc, cur) => acc + (cur.totalQuota || 0), 0) || 0
                        const totalSold = sale.items?.reduce((acc, cur) => acc + (cur.soldCount || 0), 0) || 0
                        const soldPercent = totalQuota > 0 ? Math.min(100, Math.round((totalSold / totalQuota) * 100)) : 0

                        const heroItem = sale.items?.find((i) => i.isHeroFeatured)
                        const minFlashPrice = sale.items && sale.items.length > 0
                            ? Math.min(...sale.items.map((i) => i.flashSalePrice))
                            : 0

                        return (
                            <TableRow key={sale.id} className="hover:bg-surface/30">
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono text-[11px] bg-surface">
                                                {sale.code}
                                            </Badge>
                                            {sale.priority > 0 && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    Ưu tiên #{sale.priority}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="font-semibold text-sm text-foreground leading-tight">
                                            {sale.title}
                                        </p>
                                        {sale.subtitle && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {sale.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <IconCalendarTime className="h-3.5 w-3.5 text-tech-blue shrink-0" />
                                            <span>Bắt đầu: {formatDate(sale.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <span className="w-3.5 text-center font-bold text-brand shrink-0">→</span>
                                            <span>Kết thúc: {formatDate(sale.endTime)}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                        <span
                                            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${statusBadge.className}`}
                                        >
                                            {statusBadge.label}
                                        </span>
                                        <div className="text-[11px] text-muted-foreground">
                                            {sale.isActive ? (
                                                <span className="text-emerald-600 font-medium">Đang kích hoạt</span>
                                            ) : (
                                                <span className="text-muted-foreground">Tạm dừng</span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1 text-xs">
                                        <div className="font-medium text-foreground">
                                            {sale.items?.length || 0} sản phẩm
                                        </div>
                                        {heroItem && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] bg-brand/5 text-brand border-brand/20 flex items-center gap-1 w-fit"
                                            >
                                                <IconStar className="h-3 w-3 fill-brand" />
                                                Hero Deal
                                            </Badge>
                                        )}
                                        {minFlashPrice > 0 && (
                                            <div className="text-[11px] text-muted-foreground">
                                                Từ:{" "}
                                                <strong className="font-mono tabular-nums whitespace-nowrap price-tag text-brand font-semibold">
                                                    {formatCurrency(minFlashPrice)}
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1.5 max-w-[200px]">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-mono tabular-nums">
                                                Đã bán: <strong className="text-foreground">{totalSold}</strong>/{totalQuota}
                                            </span>
                                            <span className="font-bold text-xs text-brand font-mono">
                                                {soldPercent}%
                                            </span>
                                        </div>
                                        <Progress value={soldPercent} className="h-2 bg-muted [&>div]:bg-brand" />
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <Link href={`/configs/flash-sales/${sale.id}/edit`}>
                                                <IconEdit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeleteId(sale.id)}
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {/* Modal Xác nhận Xóa Chiến dịch */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa chiến dịch Flash Sale</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa chiến dịch Flash Sale này không? Thao tác này sẽ gỡ toàn bộ sản phẩm khỏi khung giờ vàng và không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
