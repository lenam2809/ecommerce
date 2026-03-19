import { useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useGetOptionBrands } from "@/hooks/use-brands"
import { SingleSelect } from "@/components/ui/select/single-select"
import { useGetOptionCategories } from "@/hooks/use-categories"

interface BasicInfoSectionProps {
  form: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean
  isDetail?: boolean
}

export function BasicInfoSection({ form, isEditing = false, isDetail = false }: BasicInfoSectionProps) {
  const { data: categories, isLoading: categoriesLoading } = useGetOptionCategories()
  const { data: brands, isLoading: brandsLoading } = useGetOptionBrands()

  useEffect(() => {
    if (!isEditing || !categories?.data || !brands?.data) return

    const currentCategoryId = form.getValues("categoryId")
    const currentBrandId = form.getValues("brandId")

    if (currentCategoryId) {
      const categoryExists = categories.data.some((cat: any) => String(cat.id) === String(currentCategoryId)) // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!categoryExists && categories.data.length > 0) {
        form.setValue("categoryId", String(categories.data[0].value))
      }
    } else if (categories.data.length > 0) {
      form.setValue("categoryId", String(categories.data[0].value))
    }

    if (currentBrandId) {
      const brandExists = brands.data.some((brand: any) => String(brand.id) === String(currentBrandId)) // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!brandExists && brands.data.length > 0) {
        form.setValue("brandId", String(brands.data[0].value))
      }
    } else if (brands.data.length > 0) {
      form.setValue("brandId", String(brands.data[0].value))
    }
  }, [form, isEditing, categories?.data, brands?.data])

  return (
    <FormSection title="Thông tin cơ bản">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã sản phẩm *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập mã sản phẩm" {...field} disabled={isEditing || isDetail} />
              </FormControl>
              <FormDescription>Mã không quá 20 ký tự và phải duy nhất.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập SKU" {...field} disabled={isDetail} />
              </FormControl>
              <FormDescription>SKU không quá 50 ký tự và phải duy nhất.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Tên sản phẩm *</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên sản phẩm" {...field} disabled={isDetail} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả ngắn gọn về sản phẩm, điểm nổi bật, chất liệu..."
                  className="min-h-[96px]"
                  {...field}
                  disabled={isDetail}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục *</FormLabel>
              <FormControl>
                <SingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={categoriesLoading ? "Đang tải danh mục..." : "Chọn danh mục"}
                  options={categories?.data || []}
                  disabled={categoriesLoading || isDetail}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thương hiệu *</FormLabel>
              <FormControl>
                <SingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={brandsLoading ? "Đang tải thương hiệu..." : "Chọn thương hiệu"}
                  options={brands?.data || []}
                  disabled={brandsLoading || isDetail}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Hiển thị sản phẩm</FormLabel>
                <FormDescription>
                  Khi bật, sản phẩm sẽ xuất hiện trong danh sách trên trang bán hàng (tuỳ thuộc backend).
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Kích hoạt sản phẩm"
                  disabled={isDetail}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  )
}
