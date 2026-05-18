"use client"

import { logger } from '@/lib/logger'
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { BasicInfoSection } from "./form-sections/basic-info"
import { PricingSection } from "./form-sections/pricing"
import { ImagesUploadSection } from "./form-sections/images-upload"
import { SpecificationsSection } from "./form-sections/specifications"
import { VariantsSection } from "./form-sections/variants"
import { useUpdateProduct } from "@/hooks/use-products"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formUpdateSchema, UpdateProductDto } from "@/schemas/product"
import { Product } from "@/types/product"

interface ProductEditFormProps {
  product: Product
  isDetail?: boolean
}

export function ProductEditForm({ product, isDetail = false }: ProductEditFormProps) {
  const router = useRouter()
  const { mutate: updateProduct, isPending } = useUpdateProduct()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateProductDto>({
    resolver: zodResolver(formUpdateSchema),
    defaultValues: {
      id: "",
      code: "",
      name: "",
      sku: "",
      price: 0,
      salePrice: undefined,
      rating: 0,
      reviewCount: 0,
      description: "",
      stockQuantity: 0,
      publishedDate: undefined,
      isActive: true,
      categoryId: "",
      brandId: "",
      mainImage: "",
      additionalImages: [],
      specifications: [],
      colors: [],
      sizes: [],
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (!product) return

    const defaultValues: UpdateProductDto = {
      id: product.id,
      code: product.code,
      name: product.name,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      description: product.description || "",
      stockQuantity: product.stockQuantity,
      isActive: true,
      categoryId: String(product.categoryId),
      brandId: String(product.brandId),
      mainImage: product.mainImage,
      additionalImages: product.additionalImages || [],
      specifications: product.specifications || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
    }

    form.reset(defaultValues)
  }, [product, form])

  const onSubmit = async (values: UpdateProductDto) => {
    setIsSubmitting(true)

    try {
      updateProduct(values)
      // Điều hướng được xử lý trong onSuccess của hook
    } catch (error) {
      logger.error(`Lỗi khi cập nhật sản phẩm ${values.code}: `, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBusy = isSubmitting || isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} isEditing isDetail={isDetail} />
        <PricingSection form={form} isEditing isDetail={isDetail} />
        <ImagesUploadSection form={form} isEditing isDetail={isDetail} />
        <SpecificationsSection form={form} isEditing isDetail={isDetail} />
        <VariantsSection form={form} isEditing isDetail={isDetail} />

        <div className="mt-8 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isBusy}
          >
            Huỷ
          </Button>
          {!isDetail && (
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật sản phẩm
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
