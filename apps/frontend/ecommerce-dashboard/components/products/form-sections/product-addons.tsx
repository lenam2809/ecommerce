"use client"

import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormSection } from "@/components/ui/form-section"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ProductAddOn } from "@/types/product-addon"
import { useGetProductAddOns } from "@/hooks/use-product-addons"
import {
  ShieldCheckIcon,
  PackagePlusIcon,
  WrenchIcon,
  ClockIcon,
  TagIcon,
  SparklesIcon,
} from "lucide-react"

interface ProductAddOnsSectionProps {
  form: UseFormReturn<any>
  isEditing?: boolean
  isDetail?: boolean
}

export function ProductAddOnsSection({
  form,
  isEditing = false,
  isDetail = false,
}: ProductAddOnsSectionProps) {
  const { data: addOnsResult, isLoading } = useGetProductAddOns({ isActive: true })
  const availableAddOns: ProductAddOn[] = addOnsResult?.data || []

  const selectedAddOnIds: string[] = form.watch("addOnIds") || []
  const currentBrandId = form.watch("brandId")
  const currentCategoryId = form.watch("categoryId")

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + "₫"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ExtendedWarranty":
        return <ShieldCheckIcon className="h-4 w-4 text-tech-blue" />
      case "AccessoryBundle":
        return <PackagePlusIcon className="h-4 w-4 text-brand" />
      case "Installation":
        return <WrenchIcon className="h-4 w-4 text-muted-foreground" />
      default:
        return <SparklesIcon className="h-4 w-4 text-tech-blue" />
    }
  }

  const handleToggleAddOn = (id: string, checked: boolean) => {
    if (checked) {
      form.setValue("addOnIds", Array.from(new Set([...selectedAddOnIds, id])), {
        shouldDirty: true,
      })
    } else {
      form.setValue(
        "addOnIds",
        selectedAddOnIds.filter((item) => item !== id),
        { shouldDirty: true }
      )
    }
  }

  return (
    <FormSection title="Bảo hành & Gói dịch vụ mua kèm (ProductAddOns)">
      <div className="space-y-5">
        {/* Warranty and Origin Configuration (SSoT 2026) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="warrantyMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-tech-blue" />
                  Thời hạn bảo hành tiêu chuẩn (tháng)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="24"
                    className="font-mono tabular-nums bg-background border-line text-xs"
                    {...field}
                    value={field.value ?? 24}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isDetail}
                  />
                </FormControl>
                <FormDescription className="text-[11px] text-muted-foreground">
                  Chuẩn SSoT 2026: Mặc định bảo hành 24 tháng chính hãng.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originBadge"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <TagIcon className="h-3.5 w-3.5 text-brand" />
                  Huy hiệu xuất xứ / Phân phối (Origin Badge)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="vd: Chính hãng VN/A, Nhập khẩu chính ngạch..."
                    className="bg-background border-line text-xs"
                    {...field}
                    value={field.value || ""}
                    disabled={isDetail}
                  />
                </FormControl>
                <FormDescription className="text-[11px] text-muted-foreground">
                  Hiển thị badge uy tín trên thẻ sản phẩm và trang chi tiết.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Add-ons Selection List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Gói dịch vụ mua kèm khả dụng
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Tích chọn các gói bảo hành mở rộng (e-Warranty), combo phụ kiện hoặc lắp đặt áp dụng cho sản phẩm này.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-tech-blue/40 bg-tech-blue/10 text-tech-blue font-mono text-xs px-2.5 py-0.5"
            >
              Đã gán {selectedAddOnIds.length} gói
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-line bg-card">
              <p className="text-xs text-muted-foreground animate-pulse">
                Đang tải danh mục gói dịch vụ...
              </p>
            </div>
          ) : availableAddOns.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-card p-4 text-center text-xs text-muted-foreground">
              Chưa có gói dịch vụ nào trong kho. Vào mục &quot;Cấu hình &gt; Gói bảo hành & Mua kèm&quot; để tạo mới.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {availableAddOns.map((addon: ProductAddOn) => {
                const isChecked = selectedAddOnIds.includes(addon.id)
                const isBrandMatch = currentBrandId && addon.brandId === currentBrandId
                const isCategoryMatch = currentCategoryId && addon.categoryId === currentCategoryId

                return (
                  <div
                    key={addon.id}
                    onClick={() => {
                      if (!isDetail) handleToggleAddOn(addon.id, !isChecked)
                    }}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      isChecked
                        ? "border-tech-blue bg-tech-blue/5 shadow-xs dark:bg-tech-blue/10"
                        : "border-line bg-card hover:border-line/80 hover:bg-surface/50"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={isDetail}
                      onCheckedChange={(checked) => handleToggleAddOn(addon.id, checked === true)}
                      className="mt-0.5 data-[state=checked]:bg-tech-blue data-[state=checked]:border-tech-blue border-line"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(addon.addOnType)}
                          <span className="text-xs font-semibold text-foreground line-clamp-1">
                            {addon.name}
                          </span>
                        </div>
                        <span className="price-tag font-mono tabular-nums whitespace-nowrap text-xs font-bold text-brand">
                          +{formatPrice(addon.price)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-mono uppercase font-semibold text-[10px] text-foreground/80">
                          {addon.code}
                        </span>
                        {addon.durationMonths && (
                          <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-tech-blue font-medium">
                            <ClockIcon className="h-3 w-3" />
                            +{addon.durationMonths}T
                          </span>
                        )}
                        {(isBrandMatch || isCategoryMatch) && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                          >
                            Khuyến nghị theo thương hiệu/danh mục
                          </Badge>
                        )}
                      </div>

                      {addon.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {addon.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </FormSection>
  )
}
