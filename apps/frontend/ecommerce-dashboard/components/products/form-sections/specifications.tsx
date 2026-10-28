"use client"

import { useEffect, useState, useMemo } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { FormSection } from "@/components/ui/form-section"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import {
  PlusIcon,
  Trash2Icon,
  SparklesIcon,
  CpuIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react"

export interface SpecTemplateItem {
  groupName: string
  name: string
  value: string
  filterKey: string
  displayOrder: number
  isKeySpec: boolean
  isHighlight: boolean
}

export const SSOT_14_SPECIFICATIONS: SpecTemplateItem[] = [
  // Nhóm 1: Vi xử lý & Hiệu năng
  { groupName: "Vi xử lý & Hiệu năng", name: "CPU", value: "", filterKey: "cpu", displayOrder: 1, isKeySpec: true, isHighlight: true },
  { groupName: "Vi xử lý & Hiệu năng", name: "Tốc độ CPU", value: "", filterKey: "cpu_speed", displayOrder: 2, isKeySpec: false, isHighlight: false },

  // Nhóm 2: Màn hình
  { groupName: "Màn hình", name: "Kích thước màn hình", value: "", filterKey: "screen_size", displayOrder: 3, isKeySpec: false, isHighlight: false },
  { groupName: "Màn hình", name: "Độ phân giải & Tần số quét", value: "", filterKey: "screen_resolution", displayOrder: 4, isKeySpec: false, isHighlight: false },
  { groupName: "Màn hình", name: "Công nghệ màn hình", value: "", filterKey: "screen_tech", displayOrder: 5, isKeySpec: false, isHighlight: false },

  // Nhóm 3: Bộ nhớ & Lưu trữ
  { groupName: "Bộ nhớ & Lưu trữ", name: "RAM", value: "", filterKey: "ram", displayOrder: 6, isKeySpec: true, isHighlight: true },
  { groupName: "Bộ nhớ & Lưu trữ", name: "Ổ cứng lưu trữ", value: "", filterKey: "ssd", displayOrder: 7, isKeySpec: false, isHighlight: false },

  // Nhóm 4: Đồ họa & Âm thanh
  { groupName: "Đồ họa & Âm thanh", name: "Card đồ họa (GPU)", value: "", filterKey: "gpu", displayOrder: 8, isKeySpec: false, isHighlight: false },
  { groupName: "Đồ họa & Âm thanh", name: "Công nghệ âm thanh", value: "", filterKey: "audio", displayOrder: 9, isKeySpec: false, isHighlight: false },

  // Nhóm 5: Kết nối & Cổng
  { groupName: "Kết nối & Cổng", name: "Cổng giao tiếp", value: "", filterKey: "ports", displayOrder: 10, isKeySpec: false, isHighlight: false },
  { groupName: "Kết nối & Cổng", name: "Kết nối không dây", value: "", filterKey: "wireless", displayOrder: 11, isKeySpec: false, isHighlight: false },

  // Nhóm 6: Pin, Sạc & Thiết kế
  { groupName: "Pin, Sạc & Thiết kế", name: "Dung lượng pin", value: "", filterKey: "battery", displayOrder: 12, isKeySpec: false, isHighlight: false },
  { groupName: "Pin, Sạc & Thiết kế", name: "Công suất sạc", value: "", filterKey: "charging", displayOrder: 13, isKeySpec: false, isHighlight: false },
  { groupName: "Pin, Sạc & Thiết kế", name: "Trọng lượng & Kích thước", value: "", filterKey: "weight", displayOrder: 14, isKeySpec: false, isHighlight: false },
]

interface SpecificationsSectionProps {
  form: UseFormReturn<any>
  isEditing?: boolean
  isDetail?: boolean
}

export function SpecificationsSection({
  form,
  isEditing = false,
  isDetail = false,
}: SpecificationsSectionProps) {
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "specifications",
  })

  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  // Watch specifications to count current key specs dynamically
  const watchedSpecs = form.watch("specifications") || []
  const keySpecsCount = useMemo(() => {
    return watchedSpecs.filter((s: any) => s && s.isKeySpec === true).length
  }, [watchedSpecs])

  useEffect(() => {
    if (!isEditing) return

    const existingSpecs = form.getValues("specifications") || []
    if (existingSpecs.length > 0 && fields.length === 0) {
      replace(existingSpecs)
    }
  }, [form, isEditing, fields.length, replace])

  // Call Gemini AI spec generator
  const handleGenerateAiSpecs = async () => {
    const productName = form.getValues("name")
    if (!productName || !productName.trim()) {
      toast({
        title: "Thiếu tên sản phẩm",
        description: "Vui lòng nhập tên sản phẩm trước khi tạo thông số bằng AI.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGeneratingAi(true)
      const res = await fetch("/api/ai/generate-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: productName.trim() }),
      })

      const json = await res.json()
      if (json.success && json.data?.specifications) {
        replace(json.data.specifications)
        toast({
          title: "AI sinh thông số thành công",
          description: `Đã nạp 14 thông số chuẩn SSoT 2026 và chọn 2 Key Specs (${(json.data.keySpecs || []).join(", ")}).`,
        })
      } else {
        toast({
          title: "Không thể sinh thông số",
          description: json.error || "Đã xảy ra lỗi khi gọi AI.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Lỗi kết nối AI",
        description: err?.message || "Không thể kết nối đến máy chủ AI.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // Quick populate 14 standard SSoT specs
  const handleInitSsot14Specs = () => {
    replace(SSOT_14_SPECIFICATIONS)
    toast({
      title: "Khởi tạo thành công",
      description: "Đã nạp 14 thông số kỹ thuật tiêu chuẩn chia theo 6 nhóm và chọn mặc định 2 Key Specs.",
    })
  }

  return (
    <FormSection title="Thông số kỹ thuật & AI Generator">
      <div className="space-y-4">
        {/* Toolbar & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3">
          <div className="flex flex-wrap items-center gap-2">
            {!isDetail && (
              <>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleGenerateAiSpecs}
                  disabled={isGeneratingAi}
                  className="bg-brand text-white hover:bg-brand/90 transition-all font-medium shadow-sm"
                >
                  {isGeneratingAi ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SparklesIcon className="mr-2 h-4 w-4" />
                  )}
                  Tự động điền thông số bằng AI
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleInitSsot14Specs}
                  disabled={isGeneratingAi}
                  className="border-line text-foreground hover:bg-background transition-all"
                >
                  <CpuIcon className="mr-2 h-4 w-4 text-tech-blue" />
                  Khởi tạo 14 thông số chuẩn SSoT
                </Button>
              </>
            )}
          </div>

          {/* Key Specs Counter Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-tech-blue/40 bg-tech-blue text-white px-3 py-1 font-mono text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              {keySpecsCount === 2 ? (
                <CheckCircle2Icon className="h-3.5 w-3.5" />
              ) : (
                <AlertCircleIcon className="h-3.5 w-3.5 opacity-80" />
              )}
              Đã chọn {keySpecsCount}/2 Key Specs
            </Badge>
          </div>
        </div>

        {/* Specifications List */}
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line p-8 text-center text-muted-foreground bg-card">
            <CpuIcon className="mb-2 h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm font-medium">Chưa có thông số kỹ thuật nào.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Bấm &quot;Tự động điền thông số bằng AI&quot; hoặc &quot;Khởi tạo 14 thông số chuẩn SSoT&quot; để thiết lập nhanh.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden grid-cols-12 gap-3 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
              <div className="md:col-span-3">Nhóm thông số</div>
              <div className="md:col-span-3">Tên thông số</div>
              <div className="md:col-span-3">Giá trị cấu hình</div>
              <div className="md:col-span-1">Khóa lọc</div>
              <div className="md:col-span-1 text-center">Key Spec</div>
              <div className="md:col-span-1 text-right">Thao tác</div>
            </div>

            {fields.map((field, index) => {
              const currentIsKey = watchedSpecs[index]?.isKeySpec === true
              const isDisableCheckbox = !currentIsKey && keySpecsCount >= 2

              return (
                <div
                  key={field.id}
                  className={`grid grid-cols-1 items-center gap-3 rounded-lg border p-3 md:grid-cols-12 transition-colors ${
                    currentIsKey
                      ? "border-tech-blue/40 bg-tech-blue/5 dark:bg-tech-blue/10"
                      : "border-line bg-card hover:border-line/80"
                  }`}
                >
                  {/* Nhóm thông số */}
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`specifications.${index}.groupName`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:hidden">Nhóm thông số</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhóm (vd: Vi xử lý & Hiệu năng)"
                              className="text-xs h-9 bg-background border-line"
                              {...f}
                              value={f.value || ""}
                              disabled={isDetail}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tên thông số */}
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`specifications.${index}.name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:hidden">Tên thông số</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tên (vd: CPU, RAM)"
                              className="text-xs h-9 font-medium bg-background border-line"
                              {...f}
                              disabled={isDetail}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Giá trị thông số */}
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`specifications.${index}.value`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:hidden">Giá trị cấu hình</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Giá trị (vd: Apple M3 Pro, 18GB)"
                              className="text-xs h-9 bg-background border-line font-mono"
                              {...f}
                              disabled={isDetail}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Khóa lọc (FilterKey) */}
                  <div className="md:col-span-1">
                    <FormField
                      control={form.control}
                      name={`specifications.${index}.filterKey`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs md:hidden">Khóa lọc</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="cpu"
                              className="text-xs h-9 bg-background border-line font-mono text-muted-foreground"
                              {...f}
                              value={f.value || ""}
                              disabled={isDetail}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Checkbox Key Spec (tối đa 2) */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <FormField
                      control={form.control}
                      name={`specifications.${index}.isKeySpec`}
                      render={({ field: f }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={f.value === true}
                              disabled={isDetail || isDisableCheckbox}
                              onCheckedChange={(checked) => {
                                const isChecked = checked === true
                                f.onChange(isChecked)
                                form.setValue(`specifications.${index}.isHighlight`, isChecked)
                              }}
                              className="data-[state=checked]:bg-tech-blue data-[state=checked]:border-tech-blue border-line"
                              title={
                                isDisableCheckbox
                                  ? "Đã chọn đủ 2 Key Specs. Hãy bỏ chọn bớt để chọn thông số khác."
                                  : "Đánh dấu là thông số nổi bật (tối đa 2)"
                              }
                            />
                          </FormControl>
                          <span className="text-xs md:hidden font-medium">Key Spec</span>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Thao tác xóa */}
                  {!isDetail && (
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        aria-label="Xoá thông số"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Nút thêm dòng thủ công */}
        {!isDetail && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-dashed border-line text-xs hover:border-foreground"
            onClick={() =>
              append({
                name: "",
                value: "",
                groupName: "Thông số khác",
                filterKey: "",
                displayOrder: fields.length + 1,
                isKeySpec: false,
                isHighlight: false,
              })
            }
          >
            <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
            Thêm dòng thông số tùy chỉnh
          </Button>
        )}
      </div>
    </FormSection>
  )
}
