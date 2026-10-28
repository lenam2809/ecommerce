"use client"

import { useState } from "react"
import { ProductAddOn } from "@/types/product-addon"
import { useDeleteProductAddOn } from "@/hooks/use-product-addons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  PencilIcon,
  Trash2Icon,
  ShieldCheckIcon,
  PackagePlusIcon,
  WrenchIcon,
  ClockIcon,
} from "lucide-react"

interface ProductAddOnTableProps {
  addons: ProductAddOn[]
  isLoading: boolean
  onEdit: (addon: ProductAddOn) => void
}

export function ProductAddOnTable({
  addons,
  isLoading,
  onEdit,
}: ProductAddOnTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<ProductAddOn | null>(null)
  const deleteMutation = useDeleteProductAddOn()

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + "₫"
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "ExtendedWarranty":
        return (
          <Badge
            variant="outline"
            className="border-tech-blue/40 bg-tech-blue/10 text-tech-blue flex items-center gap-1 text-[11px] font-medium"
          >
            <ShieldCheckIcon className="h-3 w-3" />
            Bảo hành mở rộng
          </Badge>
        )
      case "AccessoryBundle":
        return (
          <Badge
            variant="outline"
            className="border-brand/40 bg-brand/10 text-brand flex items-center gap-1 text-[11px] font-medium"
          >
            <PackagePlusIcon className="h-3 w-3" />
            Gói phụ kiện
          </Badge>
        )
      case "Installation":
        return (
          <Badge
            variant="outline"
            className="border-line bg-surface text-foreground flex items-center gap-1 text-[11px] font-medium"
          >
            <WrenchIcon className="h-3 w-3" />
            Lắp đặt & Dịch vụ
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            {type}
          </Badge>
        )
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-line bg-card">
        <p className="text-sm text-muted-foreground animate-pulse">
          Đang tải danh sách gói dịch vụ...
        </p>
      </div>
    )
  }

  if (!addons || addons.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-card p-6 text-center text-muted-foreground">
        <ShieldCheckIcon className="mb-2 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Chưa có gói dịch vụ nào trong kho.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Bấm &quot;Thêm gói dịch vụ mới&quot; để tạo gói bảo hành AppleCare+, gói lắp đặt hoặc phụ kiện.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-line bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-surface border-line">
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="font-semibold text-foreground text-xs">Mã gói</TableHead>
              <TableHead className="font-semibold text-foreground text-xs">Tên dịch vụ & Mô tả</TableHead>
              <TableHead className="font-semibold text-foreground text-xs">Phân loại</TableHead>
              <TableHead className="font-semibold text-foreground text-xs">Thời hạn cộng</TableHead>
              <TableHead className="font-semibold text-foreground text-xs text-right">Giá bán</TableHead>
              <TableHead className="font-semibold text-foreground text-xs text-center">Trạng thái</TableHead>
              <TableHead className="font-semibold text-foreground text-xs text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.map((item) => (
              <TableRow key={item.id} className="border-line hover:bg-surface/50 transition-colors">
                {/* Code */}
                <TableCell className="font-mono text-xs font-semibold text-foreground uppercase">
                  {item.code}
                </TableCell>

                {/* Name & Description */}
                <TableCell className="max-w-xs">
                  <p className="text-xs font-semibold text-foreground leading-snug">{item.name}</p>
                  {item.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  {item.product && (
                    <span className="inline-block text-[10px] text-tech-blue font-medium mt-1">
                      Dành riêng: {item.product.name}
                    </span>
                  )}
                </TableCell>

                {/* Type */}
                <TableCell>{getTypeBadge(item.addOnType)}</TableCell>

                {/* Duration */}
                <TableCell className="text-xs">
                  {item.durationMonths ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-foreground font-medium">
                      <ClockIcon className="h-3 w-3 text-muted-foreground" />
                      +{item.durationMonths} tháng
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                {/* Price (Strict SSoT 2026: font-mono tabular-nums whitespace-nowrap / .price-tag) */}
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="price-tag font-mono tabular-nums whitespace-nowrap text-xs font-bold text-brand">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="font-mono tabular-nums whitespace-nowrap text-[10px] text-muted-foreground line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      item.isActive
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-line bg-surface text-muted-foreground"
                    }`}
                  >
                    {item.isActive ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(item)}
                      title="Chỉnh sửa gói"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(item)}
                      title="Xóa gói"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-line">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Xác nhận xóa gói dịch vụ</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa gói{" "}
              <strong className="text-foreground font-semibold">
                {deleteTarget?.name} ({deleteTarget?.code})
              </strong>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
