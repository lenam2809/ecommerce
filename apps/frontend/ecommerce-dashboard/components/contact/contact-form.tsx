"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateContact, useUpdateContact } from "@/hooks/use-contact"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Save, Phone, Mail, MapPin, ExternalLink, MessageSquare } from "lucide-react"
import type { ContactDto } from "@/types/contact"

const contactSchema = z.object({
    phone: z.object({
        numberOrAddress: z.string().min(1, "Số điện thoại không được để trống"),
        hoursOrDescription: z.string().min(1, "Giờ làm việc không được để trống"),
    }),
    email: z.object({
        numberOrAddress: z.string().email("Email không hợp lệ"),
        hoursOrDescription: z.string().min(1, "Mô tả email không được để trống"),
    }),
    office: z.object({
        numberOrAddress: z.string().min(1, "Địa chỉ văn phòng không được để trống"),
        hoursOrDescription: z.string().min(1, "Giờ làm việc không được để trống"),
    }),
    social: z.array(
        z.object({
            name: z.string().min(1, "Tên mạng xã hội không được để trống"),
            url: z.string().url("URL không hợp lệ"),
        }),
    ),
    faqs: z.array(
        z.object({
            question: z.string().min(1, "Câu hỏi không được để trống"),
            answer: z.string().min(1, "Câu trả lời không được để trống"),
        }),
    ),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
    initialData?: ContactDto | null
    onCancel: () => void
    isEditing?: boolean
}

export function ContactForm({ initialData, onCancel, isEditing = false }: ContactFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const createMutation = useCreateContact()
    const updateMutation = useUpdateContact()

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            phone: {
                numberOrAddress: initialData?.phone.numberOrAddress || "",
                hoursOrDescription: initialData?.phone.hoursOrDescription || "",
            },
            email: {
                numberOrAddress: initialData?.email.numberOrAddress || "",
                hoursOrDescription: initialData?.email.hoursOrDescription || "",
            },
            office: {
                numberOrAddress: initialData?.office.numberOrAddress || "",
                hoursOrDescription: initialData?.office.hoursOrDescription || "",
            },
            social: initialData?.social || [],
            faqs: initialData?.faqs || [],
        },
    })

    const {
        fields: socialFields,
        append: appendSocial,
        remove: removeSocial,
    } = useFieldArray({
        control: form.control,
        name: "social",
    })

    const {
        fields: faqFields,
        append: appendFaq,
        remove: removeFaq,
    } = useFieldArray({
        control: form.control,
        name: "faqs",
    })

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true)
        try {
            if (isEditing && initialData?.id) {
                await updateMutation.mutateAsync({
                    id: initialData.id,
                    data: { ...data, id: initialData.id },
                })
            } else {
                await createMutation.mutateAsync(data)
            }
            onCancel()
        } catch (error) {
            console.error("Error submitting form:", error)
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
                        {isEditing ? "Chỉnh sửa thông tin liên hệ" : "Tạo mới thông tin liên hệ"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing ? "Cập nhật thông tin liên hệ" : "Tạo thông tin liên hệ mới"}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Contact Info */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Phone */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Điện thoại
                                </CardTitle>
                                <CardDescription>Thông tin số điện thoại liên hệ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="phone.numberOrAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số điện thoại</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+84 123 456 789" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone.hoursOrDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giờ làm việc</FormLabel>
                                            <FormControl>
                                                <Input placeholder="8:00 - 17:00, T2-T6" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Email */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Email
                                </CardTitle>
                                <CardDescription>Thông tin email liên hệ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email.numberOrAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Địa chỉ email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="contact@company.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email.hoursOrDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Email hỗ trợ khách hàng" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Office */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Văn phòng
                                </CardTitle>
                                <CardDescription>Thông tin địa chỉ văn phòng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="office.numberOrAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Địa chỉ</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="123 Đường ABC, Quận XYZ, TP.HCM" className="min-h-[60px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="office.hoursOrDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giờ làm việc</FormLabel>
                                            <FormControl>
                                                <Input placeholder="8:00 - 17:00, T2-T6" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Social Media */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <ExternalLink className="h-5 w-5" />
                                        Mạng xã hội
                                    </CardTitle>
                                    <CardDescription>Các liên kết mạng xã hội</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendSocial({ name: "", url: "" })}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm mạng xã hội
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {socialFields.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Chưa có mạng xã hội nào. Nhấn &quot;Thêm mạng xã hội&quot; để bắt đầu.
                                </div>
                            ) : (
                                socialFields.map((field, index) => (
                                    <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary">Mạng xã hội {index + 1}</Badge>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSocial(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`social.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tên</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Facebook, Instagram, Twitter..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`social.${index}.url`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://facebook.com/yourpage" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* FAQs */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Câu hỏi thường gặp
                                    </CardTitle>
                                    <CardDescription>Các câu hỏi và câu trả lời thường gặp</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendFaq({ question: "", answer: "" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm FAQ
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {faqFields.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Chưa có FAQ nào. Nhấn &quot;Thêm FAQ&quot; để bắt đầu.
                                </div>
                            ) : (
                                faqFields.map((field, index) => (
                                    <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary">FAQ {index + 1}</Badge>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name={`faqs.${index}.question`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Câu hỏi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập câu hỏi..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`faqs.${index}.answer`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Câu trả lời</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Nhập câu trả lời..." className="min-h-[80px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))
                            )}
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
