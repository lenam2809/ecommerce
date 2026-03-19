// src/components/products/form-sections/variants.tsx
import { useState, useEffect } from "react"
import { useFieldArray } from "react-hook-form"

import { FormSection } from "@/components/ui/form-section"
import { FormDescription, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, X } from "lucide-react"

interface VariantsSectionProps {
  form: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean
  isDetail?: boolean
}

export function VariantsSection({ form, isEditing = false, isDetail = false }: VariantsSectionProps) {
  const [colorInput, setColorInput] = useState("")
  const [sizeInput, setSizeInput] = useState("")

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
    replace: replaceColors,
  } = useFieldArray({
    control: form.control,
    name: "colors",
  })

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
    replace: replaceSizes,
  } = useFieldArray({
    control: form.control,
    name: "sizes",
  })

  useEffect(() => {
    if (!isEditing) return

    const existingColors = form.getValues("colors") || []
    const existingSizes = form.getValues("sizes") || []

    if (existingColors.length > 0) {
      replaceColors(existingColors)
    }

    if (existingSizes.length > 0) {
      replaceSizes(existingSizes)
    }
  }, [form, isEditing, replaceColors, replaceSizes])

  const handleAddColor = () => {
    const newColor = colorInput.trim()
    if (!newColor) return

    const currentColors = colorFields.map((field) => field as unknown as string)
    if (!currentColors.includes(newColor)) {
      appendColor(newColor)
      setColorInput("")
    }
  }

  const handleAddSize = () => {
    const newSize = sizeInput.trim()
    if (!newSize) return

    const currentSizes = sizeFields.map((field) => field as unknown as string)
    if (!currentSizes.includes(newSize)) {
      appendSize(newSize)
      setSizeInput("")
    }
  }

  return (
    <FormSection title="Biến thể sản phẩm">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <FormLabel>Màu sắc</FormLabel>
          <FormDescription className="mb-2">
            {isDetail
              ? "Danh sách màu sắc hiện có của sản phẩm."
              : "Thêm các màu sắc có sẵn cho sản phẩm (ví dụ: Đỏ, Xanh, Đen...)."}
          </FormDescription>

          <div className="mb-4 flex flex-wrap gap-2">
            {colorFields.map((field, index) => (
              <Badge key={field.id} variant="secondary" className="flex items-center gap-1 py-1 px-3 text-sm">
                {form.getValues(`colors.${index}`)}
                {!isDetail && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => removeColor(index)}
                    aria-label="Xoá màu"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>

          {!isDetail && (
            <div className="flex gap-2">
              <Input
                placeholder="Nhập màu sắc"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddColor()
                  }
                }}
              />
              <Button type="button" onClick={handleAddColor}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div>
          <FormLabel>Kích thước</FormLabel>
          <FormDescription className="mb-2">
            {isDetail
              ? "Danh sách kích thước hiện có của sản phẩm."
              : "Thêm các kích thước có sẵn cho sản phẩm (ví dụ: S, M, L, XL...)."}
          </FormDescription>

          <div className="mb-4 flex flex-wrap gap-2">
            {sizeFields.map((field, index) => (
              <Badge key={field.id} variant="secondary" className="flex items-center gap-1 py-1 px-3 text-sm">
                {form.getValues(`sizes.${index}`)}
                {!isDetail && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => removeSize(index)}
                    aria-label="Xoá kích thước"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>

          {!isDetail && (
            <div className="flex gap-2">
              <Input
                placeholder="Nhập kích thước"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSize()
                  }
                }}
              />
              <Button type="button" onClick={handleAddSize}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  )
}
