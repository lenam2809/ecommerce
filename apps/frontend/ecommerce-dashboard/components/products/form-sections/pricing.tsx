// src/components/products/form-sections/pricing.tsx
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormSection } from "@/components/ui/form-section"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"

interface PricingSectionProps {
  form: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean
  isDetail?: boolean
}

export function PricingSection({ form, isDetail = false }: PricingSectionProps) {
  return (
    <FormSection title="Giá & kho hàng">
      <div className="space-y-4">
        <FormDescription className="mb-2">
          {isDetail
            ? "Thông tin giá và số lượng tồn kho của sản phẩm."
            : "Nhập giá bán và số lượng tồn kho cho sản phẩm."}
        </FormDescription>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá gốc {!isDetail && "*"}</FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="Nhập giá gốc"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    disabled={isDetail}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá khuyến mãi</FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="Nhập giá khuyến mãi (nếu có)"
                    value={field.value}
                    onChange={(value) => field.onChange(value || undefined)}
                    disabled={isDetail}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng kho {!isDetail && "*"}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập số lượng tồn"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isDetail}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormSection>
  )
}
