"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ProductAddOn,
  CreateProductAddOnRequest,
  UpdateProductAddOnRequest,
  ProductAddOnType,
} from "@/types/product-addon"
import { useCreateProductAddOn, useUpdateProductAddOn } from "@/hooks/use-product-addons"
import { Loader2Icon } from "lucide-react"

interface ProductAddOnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addon: ProductAddOn | null
}

export function ProductAddOnDialog({
  open,
  onOpenChange,
  addon,
}: ProductAddOnDialogProps) {
  const isEditing = !!addon

  const createMutation = useCreateProductAddOn()
  const updateMutation = useUpdateProductAddOn()

  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [addOnType, setAddOnType] = useState<ProductAddOnType>("ExtendedWarranty")
  const [price, setPrice] = useState<number>(0)
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined)
  const [durationMonths, setDurationMonths] = useState<number | undefined>(12)
  const [isActive, setIsActive] = useState(true)
  const [displayOrder, setDisplayOrder] = useState<number>(0)

  useEffect(() => {
    if (addon) {
      setCode(addon.code)
      setName(addon.name)
      setDescription(addon.description || "")
      setAddOnType((addon.addOnType as ProductAddOnType) || "ExtendedWarranty")
      setPrice(addon.price)
      setOriginalPrice(addon.originalPrice ?? undefined)
      setDurationMonths(addon.durationMonths ?? undefined)
      setIsActive(addon.isActive)
      setDisplayOrder(addon.displayOrder || 0)
    } else {
      setCode("")
      setName("")
      setDescription("")
      setAddOnType("ExtendedWarranty")
      setPrice(0)
      setOriginalPrice(undefined)
      setDurationMonths(12)
      setIsActive(true)
      setDisplayOrder(0)
    }
  }, [addon, open])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing && addon) {
      const payload: UpdateProductAddOnRequest = {
        id: addon.id,
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || null,
        addOnType,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        durationMonths: durationMonths ? Number(durationMonths) : null,
        isActive,
        displayOrder: Number(displayOrder),
        productId: addon.productId,
        categoryId: addon.categoryId,
        brandId: addon.brandId,
      }
      await updateMutation.mutateAsync({ id: addon.id, data: payload })
      onOpenChange(false)
    } else {
      const payload: CreateProductAddOnRequest = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || null,
        addOnType,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        durationMonths: durationMonths ? Number(durationMonths) : null,
        isActive,
        displayOrder: Number(displayOrder),
      }
      await createMutation.mutateAsync(payload)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-line">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {isEditing ? "Chỉnh sửa gói dịch vụ" : "Thêm mới gói dịch vụ / Bảo hành"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cấu hình gói dịch vụ mua kèm, bảo hành mở rộng hoặc lắp đặt cho sản phẩm ShopViet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-foreground text-xs font-semibold">
                  Mã gói <span className="text-brand">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="vd: APPLECARE_MBP14"
                  className="font-mono uppercase bg-background border-line"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addOnType" className="text-foreground text-xs font-semibold">
                  Loại gói dịch vụ
                </Label>
                <Select
                  value={addOnType}
                  onValueChange={(val) => setAddOnType(val as ProductAddOnType)}
                >
                  <SelectTrigger id="addOnType" className="bg-background border-line">
                    <SelectValue placeholder="Chọn loại dịch vụ" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-line">
                    <SelectItem value="ExtendedWarranty">Bảo hành mở rộng (e-Warranty)</SelectItem>
                    <SelectItem value="AccessoryBundle">Gói phụ kiện đi kèm</SelectItem>
                    <SelectItem value="Installation">Dịch vụ & Cài đặt phần mềm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-foreground text-xs font-semibold">
                Tên gói dịch vụ <span className="text-brand">*</span>
              </Label>
              <Input
                id="name"
                placeholder="vd: AppleCare+ 3 năm cho MacBook Pro 14"
                className="bg-background border-line"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-foreground text-xs font-semibold">
                  Giá bán (₫) <span className="text-brand">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  className="font-mono tabular-nums bg-background border-line"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="originalPrice" className="text-foreground text-xs font-semibold">
                  Giá niêm yết (₫)
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Để trống nếu không giảm"
                  className="font-mono tabular-nums bg-background border-line"
                  value={originalPrice ?? ""}
                  onChange={(e) =>
                    setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="durationMonths" className="text-foreground text-xs font-semibold">
                  Thời hạn cộng thêm (tháng)
                </Label>
                <Input
                  id="durationMonths"
                  type="number"
                  min="0"
                  placeholder="vd: 12, 24, 36"
                  className="font-mono tabular-nums bg-background border-line"
                  value={durationMonths ?? ""}
                  onChange={(e) =>
                    setDurationMonths(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <Label htmlFor="displayOrder" className="text-foreground text-xs font-semibold">
                  Thứ tự hiển thị
                </Label>
                <Input
                  id="displayOrder"
                  type="number"
                  className="font-mono tabular-nums bg-background border-line"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-3 mt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-xs font-semibold text-foreground">
                    Kích hoạt gói
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Cho phép chọn khi mua sản phẩm
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-foreground text-xs font-semibold">
                Mô tả chi tiết quyền lợi
              </Label>
              <Textarea
                id="description"
                placeholder="vd: Bảo hành rơi vỡ, vào nước 1 đổi 1 trong 30 ngày đầu, hỗ trợ kỹ thuật 24/7..."
                className="bg-background border-line text-xs min-h-[70px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand text-white hover:bg-brand/90 font-medium"
            >
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Cập nhật gói" : "Tạo gói mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
