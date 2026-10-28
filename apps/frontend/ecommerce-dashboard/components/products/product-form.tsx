"use client"

import { logger } from '@/lib/logger'
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { BasicInfoSection } from "./form-sections/basic-info"
import { PricingSection } from "./form-sections/pricing"
import { ImagesUploadSection } from "./form-sections/images-upload"
import { SpecificationsSection } from "./form-sections/specifications"
import { ProductAddOnsSection } from "./form-sections/product-addons"
import { VariantsSection } from "./form-sections/variants"
import { useCreateProduct } from "@/hooks/use-products"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { CreateProductDto, formCreateSchema } from "@/schemas/product"

export function ProductForm() {
  const router = useRouter()
  const { mutate: createProduct, isPending } = useCreateProduct()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<any>({
    resolver: zodResolver(formCreateSchema),
    defaultValues: {
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
      mainImage: undefined as unknown as File,
      additionalImages: [],
      specifications: [],
      warrantyMonths: 24,
      originBadge: "",
      addOnIds: [],
      colors: [],
      sizes: [],
    },
  })

  const onSubmit = async (values: any) => {
    setIsSubmitting(true)

    try {
      createProduct(values as CreateProductDto)
      // Điều hướng được xử lý trong onSuccess của hook
    } catch (error) {
      logger.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  const isBusy = isSubmitting || isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <PricingSection form={form} />
        <ImagesUploadSection form={form} />
        <SpecificationsSection form={form} />
        <ProductAddOnsSection form={form} />
        <VariantsSection form={form} />

        <div className="mt-8 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isBusy}>
            Huỷ
          </Button>

          <Button type="submit" disabled={isBusy} className="bg-brand text-white hover:bg-brand/90 font-medium">
            {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Thêm sản phẩm
          </Button>
        </div>
      </form>
    </Form>
  )
}
