import { useFieldArray } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FormSection } from "@/components/ui/form-section"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormSingleSelect } from "@/components/ui/select/form-single-select"
import { useGetOptionProducts } from "@/hooks/use-products"
import { TrashIcon, PlusIcon } from "lucide-react"
import React, { useEffect, useState } from "react"
import { productService } from "@/services/product-service"

interface OrderItemsSectionProps {
  form: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean
  isDetail?: boolean
}

export function OrderItemsSection({ form, isDetail = false }: OrderItemsSectionProps) {
  const { data: products, isLoading: productsLoading } = useGetOptionProducts()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
  })

  const watchedOrderItems = form.watch("orderItems") as any[] // eslint-disable-line @typescript-eslint/no-explicit-any

  const [productDataMap, setProductDataMap] = useState<Record<string, { colors: string[]; sizes: string[] }>>({})
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({})

  const productIds = watchedOrderItems?.map((item) => item?.productId || "") || []

  useEffect(() => {
    const fetchProductData = async (productId: string) => {
      if (!productId || productDataMap[productId]) return

      setLoadingProducts((prev) => ({ ...prev, [productId]: true }))
      try {
        const response = await productService.getProductById(productId)
        setProductDataMap((prev) => ({
          ...prev,
          [productId]: {
            colors: response.data?.colors || [],
            sizes: response.data?.sizes || [],
          },
        }))
      } catch (error) {
        console.error("Error fetching product data:", error)
      } finally {
        setLoadingProducts((prev) => ({ ...prev, [productId]: false }))
      }
    }

    productIds.forEach((productId) => {
      if (productId) {
        fetchProductData(productId)
      }
    })
  }, [productIds.join(","), productDataMap])

  const handleAddItem = () => {
    append({
      productId: "",
      quantity: 1,
      color: "",
      size: "",
    })
  }

  return (
    <FormSection title="Danh sách sản phẩm">
      <div className="space-y-4">
        {fields.map((field, index) => {
          const productId = watchedOrderItems[index]?.productId || ""
          const productData = productId ? productDataMap[productId] : null
          const isLoading = productId ? loadingProducts[productId] : false

          return (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-6"
            >
              {/* Product selection */}
              <div className="md:col-span-3">
                {products ? (
                  <FormSingleSelect
                    name={`orderItems.${index}.productId`}
                    label="Sản phẩm *"
                    placeholder="Chọn sản phẩm"
                    options={products?.data || []}
                    isLoading={productsLoading}
                    loadingMessage="Đang tải danh sách sản phẩm..."
                    disabled={isDetail}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name={`orderItems.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID sản phẩm *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập ID sản phẩm" {...field} disabled={isDetail} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Quantity */}
              <FormField
                control={form.control}
                name={`orderItems.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Số lượng"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        disabled={isDetail}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color */}
              <FormField
                control={form.control}
                name={`orderItems.${index}.color`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu sắc</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isLoading
                            ? "Đang tải màu sắc..."
                            : productData?.colors?.length
                              ? `Chọn một trong các màu: ${productData.colors.join(", ")}`
                              : "Nhập màu sắc (nếu cần)"
                        }
                        {...field}
                        disabled={isDetail}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Size */}
              <FormField
                control={form.control}
                name={`orderItems.${index}.size`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kích thước</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isLoading
                            ? "Đang tải kích thước..."
                            : productData?.sizes?.length
                              ? `Chọn một trong các kích thước: ${productData.sizes.join(", ")}`
                              : "Nhập kích thước (nếu cần)"
                        }
                        {...field}
                        disabled={isDetail}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remove button */}
              {!isDetail && (
                <div className="flex items-start justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label="Xoá sản phẩm khỏi đơn"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}

        {!isDetail && (
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        )}
      </div>
    </FormSection>
  )
}
