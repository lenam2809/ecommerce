// src/components/products/form-sections/specifications.tsx
import { useEffect } from "react"
import { useFieldArray } from "react-hook-form"

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
import { Button } from "@/components/ui/button"
import { PlusIcon, Trash2Icon } from "lucide-react"

interface SpecificationsSectionProps {
  form: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isEditing?: boolean
  isDetail?: boolean
}

export function SpecificationsSection({ form, isEditing = false, isDetail = false }: SpecificationsSectionProps) {
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "specifications",
  })

  useEffect(() => {
    if (!isEditing) return

    const existingSpecs = form.getValues("specifications") || []

    if (existingSpecs.length > 0 && fields.length === 0) {
      replace(existingSpecs)
    }
  }, [form, isEditing, fields.length, replace])

  return (
    <FormSection title="Thông số kỹ thuật">
      <div className="space-y-4">
        <FormDescription className="mb-2">
          {isDetail
            ? "Danh sách thông số kỹ thuật của sản phẩm."
            : "Thêm các thông số kỹ thuật (ví dụ: Chất liệu, Kích thước, Trọng lượng...)."}
        </FormDescription>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
            <div className="md:col-span-5">
              <FormField
                control={form.control}
                name={`specifications.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index !== 0 || isDetail ? "sr-only" : undefined}>Tên thông số</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên thông số" {...field} disabled={isDetail} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-6">
              <FormField
                control={form.control}
                name={`specifications.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index !== 0 || isDetail ? "sr-only" : undefined}>Giá trị</FormLabel>
                    <FormControl>
                      <Input placeholder="Giá trị" {...field} disabled={isDetail} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isDetail && (
              <div className="md:col-span-1 flex justify-end">
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Xoá thông số">
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {!isDetail && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ name: "", value: "" })}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Thêm thông số
          </Button>
        )}
      </div>
    </FormSection>
  )
}
