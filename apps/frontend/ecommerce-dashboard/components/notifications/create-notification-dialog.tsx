"use client"

import { logger } from '@/lib/logger'
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"
import { useSendPromotionNotification, useSendMaintenanceNotification } from "@/hooks/use-notifications"
import { DatePicker } from "../date-picker"


const notificationSchema = z.object({
    type: z.enum(["promotion", "maintenance"]),
    title: z.string().min(1, "Tiêu đề là bắt buộc").max(100, "Tiêu đề phải ít hơn 100 ký tự"),
    message: z.string().min(1, "Nội dung là bắt buộc").max(500, "Nội dung phải ít hơn 500 ký tự"),
    expiresAt: z.date().optional(),
    targetUserId: z.string().optional(),
    targetGroup: z.string().optional(),
    actionUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
    imageUrl: z.string().url("URL hình ảnh không hợp lệ").optional().or(z.literal("")),
    scheduledTime: z.date().optional(),
    durationMinutes: z.number().min(1, "Thời gian phải lớn hơn 0").optional(),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface CreateNotificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateNotificationDialog({ open, onOpenChange }: CreateNotificationDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const sendPromotionNotification = useSendPromotionNotification()
    const sendMaintenanceNotification = useSendMaintenanceNotification()

    const form = useForm<NotificationFormData>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            type: "promotion",
            title: "",
            message: "",
            expiresAt: undefined,
            scheduledTime: undefined,
            targetGroup: "all",
            actionUrl: "",
            imageUrl: "",
            durationMinutes: 120,
        },
    })

    const notificationType = form.watch("type")

    const onSubmit = async (data: NotificationFormData) => {
        setIsSubmitting(true)
        try {
            if (data.type === "promotion") {
                await sendPromotionNotification.mutateAsync({
                    title: data.title,
                    message: data.message,
                    expiresAt: data.expiresAt || undefined,
                    targetUserId: data.targetUserId,
                    targetGroup: data.targetGroup,
                    actionUrl: data.actionUrl || undefined,
                    imageUrl: data.imageUrl || undefined,
                })
            } else {
                await sendMaintenanceNotification.mutateAsync({
                    title: data.title,
                    message: data.message,
                    scheduledTime: data.scheduledTime || new Date(),
                    durationMinutes: data.durationMinutes || 120,
                    actionUrl: data.actionUrl || undefined,
                })
            }

            form.reset()
            onOpenChange(false)
        } catch (error) {
            logger.error("Không thể gửi thông báo:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto z-50">
                <DialogHeader>
                    <DialogTitle>Tạo thông báo mới</DialogTitle>
                    <DialogDescription>
                        Gửi thông báo mới đến người dùng. Chọn giữa thông báo khuyến mãi và cảnh báo bảo trì.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Loại thông báo</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <div className="flex items-center space-x-3 space-y-0">
                                                <RadioGroupItem value="promotion" id="promotion" />
                                                <Label htmlFor="promotion" className="font-normal">
                                                    Khuyến mãi - Thông báo marketing và ưu đãi
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 space-y-0">
                                                <RadioGroupItem value="maintenance" id="maintenance" />
                                                <Label htmlFor="maintenance" className="font-normal">
                                                    Bảo trì - Cảnh báo bảo trì hệ thống và thời gian ngừng hoạt động
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu đề</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tiêu đề thông báo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="actionUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL hành động (tùy chọn)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nội dung</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Nhập nội dung thông báo" className="min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormDescription>Tối đa 500 ký tự. Hãy viết rõ ràng và súc tích.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL hình ảnh (tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/image.jpg" {...field} />
                                    </FormControl>
                                    <FormDescription>URL hình ảnh đính kèm thông báo</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {notificationType === "promotion" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="targetGroup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Đối tượng mục tiêu</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn đối tượng" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                                                    <SelectItem value="active">Người dùng hoạt động</SelectItem>
                                                    <SelectItem value="premium">Người dùng premium</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DatePicker
                                    form={form}
                                    name="expiresAt"
                                    label="Ngày hết hạn (tùy chọn)"
                                    placeholder="Chọn ngày hết hạn"
                                    dateFormat="dd/MM/yyyy"
                                    clearable={true}
                                    showTodayButton={true}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DatePicker
                                    form={form}
                                    name="scheduledTime"
                                    label="Thời gian bảo trì"
                                    placeholder="Chọn thời gian"
                                    dateFormat="dd/MM/yyyy"
                                    clearable={true}
                                    showTodayButton={true}
                                />

                                <FormField
                                    control={form.control}
                                    name="durationMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Thời gian bảo trì (phút)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        placeholder="120"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    />
                                                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Thời gian dự kiến bảo trì tính bằng phút</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang gửi..." : "Gửi thông báo"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
