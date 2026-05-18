"use client"

import { logger } from '@/lib/logger'
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateAboutSection, useUpdateAboutSection } from "@/hooks/use-about"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Save, Building2, Users, Target, History, Megaphone } from "lucide-react"
import type { AboutDto } from "@/types/about"

const aboutSchema = z.object({
    hero: z.object({
        title: z.string().min(1, "Tiêu đề không được để trống"),
        description: z.string().min(1, "Mô tả không được để trống"),
    }),
    values: z
        .array(
            z.object({
                title: z.string().min(1, "Tiêu đề giá trị không được để trống"),
                description: z.string().min(1, "Mô tả giá trị không được để trống"),
            }),
        )
        .min(1, "Phải có ít nhất một giá trị cốt lõi"),
    historyTitle: z.string().min(1, "Tiêu đề lịch sử không được để trống"),
    historyParagraphs: z.array(z.object({ content: z.string().min(1, "Đoạn văn không được để trống") })).min(1, "Phải có ít nhất một đoạn văn"), // Modified
    team: z.array(
        z.object({
            name: z.string().min(1, "Tên thành viên không được để trống"),
            role: z.string().min(1, "Vai trò không được để trống"),
            imageUrl: z.string().url("URL hình ảnh không hợp lệ"),
            bio: z.string().min(1, "Tiểu sử không được để trống"),
        }),
    ),
    cta: z.object({
        title: z.string().min(1, "Tiêu đề CTA không được để trống"),
        description: z.string().min(1, "Mô tả CTA không được để trống"),
    }),
})

type AboutFormData = z.infer<typeof aboutSchema>

interface AboutFormProps {
    initialData?: AboutDto | null
    onCancel: () => void
    isEditing?: boolean
}

export function AboutForm({ initialData, onCancel, isEditing = false }: AboutFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const createMutation = useCreateAboutSection()
    const updateMutation = useUpdateAboutSection()

    const form = useForm<AboutFormData>({
        resolver: zodResolver(aboutSchema),
        defaultValues: {
            hero: {
                title: initialData?.hero.title || "",
                description: initialData?.hero.description || "",
            },
            values: initialData?.values || [{ title: "", description: "" }],
            historyTitle: initialData?.history.title || "",
            historyParagraphs: initialData?.history.paragraphs.map(p => ({ content: p })) || [{ content: "" }],
            team: initialData?.team || [],
            cta: {
                title: initialData?.cta.title || "",
                description: initialData?.cta.description || "",
            },
        },
    })

    const { fields: valueFields, append: appendValue, remove: removeValue } = useFieldArray({
        control: form.control,
        name: "values",
    })

    const { fields: paragraphFields, append: appendParagraph, remove: removeParagraph } = useFieldArray<AboutFormData>({
        control: form.control,
        name: "historyParagraphs",
    })

    const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
        control: form.control,
        name: "team",
    })

    const onSubmit = async (data: AboutFormData) => {
        setIsSubmitting(true)
        try {
            const payload: AboutDto = {
                ...data,
                history: {
                    title: data.historyTitle,
                    // Map back to an array of strings for the DTO
                    paragraphs: data.historyParagraphs.map(p => p.content), // Modified
                },
            }
            if (isEditing && initialData?.id) {
                await updateMutation.mutateAsync({ id: initialData.id, data: { ...payload, id: initialData.id } })
            } else {
                await createMutation.mutateAsync(payload)
            }
            onCancel()
        } catch (error) {
            logger.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? "Chỉnh sửa thông tin About" : "Tạo mới thông tin About"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing ? "Cập nhật thông tin về doanh nghiệp" : "Tạo thông tin mới về doanh nghiệp"}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Hero Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Hero Section
                            </CardTitle>
                            <CardDescription>Phần giới thiệu chính về doanh nghiệp</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="hero.title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu đề chính</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tiêu đề chính..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hero.description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Nhập mô tả về doanh nghiệp..." className="min-h-[100px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Values Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Giá trị cốt lõi
                                    </CardTitle>
                                    <CardDescription>Các giá trị cốt lõi của doanh nghiệp</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendValue({ title: "", description: "" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm giá trị
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {valueFields.map((field, index) => (
                                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary">Giá trị {index + 1}</Badge>
                                        {valueFields.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeValue(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name={`values.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tiêu đề</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập tiêu đề giá trị..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`values.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mô tả</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Nhập mô tả giá trị..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* History Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        Lịch sử doanh nghiệp
                                    </CardTitle>
                                    <CardDescription>Câu chuyện và lịch sử phát triển</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendParagraph({ content: "" })}> {/* Modified */}
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm đoạn văn
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="historyTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu đề</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tiêu đề lịch sử..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {paragraphFields.map((field, index) => (
                                <div key={field.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Đoạn văn {index + 1}</FormLabel>
                                        {paragraphFields.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeParagraph(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name={`historyParagraphs.${index}.content`} // Modified
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea placeholder="Nhập nội dung đoạn văn..." className="min-h-[80px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Team Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Đội ngũ
                                    </CardTitle>
                                    <CardDescription>Thông tin về các thành viên trong đội ngũ</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendTeam({ name: "", role: "", imageUrl: "", bio: "" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm thành viên
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {teamFields.map((field, index) => (
                                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary">Thành viên {index + 1}</Badge>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTeam(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`team.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tên</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập tên thành viên..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`team.${index}.role`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Vai trò</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập vai trò..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name={`team.${index}.imageUrl`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL hình ảnh</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://example.com/image.jpg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`team.${index}.bio`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tiểu sử</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Nhập tiểu sử thành viên..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                Call to Action
                            </CardTitle>
                            <CardDescription>Lời kêu gọi hành động cuối trang</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="cta.title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu đề CTA</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tiêu đề CTA..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cta.description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả CTA</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Nhập mô tả CTA..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isSubmitting} className="gap-2">
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
