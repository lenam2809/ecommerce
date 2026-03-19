"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { User } from "@/types/user"
import { useUpdateProfile } from "@/hooks/use-account"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AvatarUpload from "./avatar-upload"

const profileFormSchema = z.object({
    firstName: z.string().min(2, {
        message: "Tên phải có ít nhất 2 ký tự.",
    }),
    lastName: z.string().min(2, {
        message: "Họ phải có ít nhất 2 ký tự.",
    }),
    phoneNumber: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
    initialData?: User
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
    const [avatar, setAvatar] = useState<File | string | undefined>(initialData?.avatar as string)

    const { mutate: updateProfile, isPending } = useUpdateProfile()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
            phoneNumber: initialData?.phoneNumber || "",
        },
    })

    function onSubmit(data: ProfileFormValues) {
        updateProfile({
            ...data,
            avatar: avatar,
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin tài khoản</CardTitle>
                    <CardDescription>Cập nhật thông tin cá nhân của bạn và cách người khác nhìn thấy bạn trên nền tảng.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <AvatarUpload currentAvatar={initialData?.avatar as string} onAvatarChange={setAvatar} />
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 000-0000" {...field} />
                                        </FormControl>
                                        <FormDescription>Số điện thoại của bạn được sử dụng để khôi phục tài khoản và nhận thông báo.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
