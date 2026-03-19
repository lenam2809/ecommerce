"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useChangePassword } from "@/hooks/use-account"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

const passwordFormSchema = z
    .object({
        currentPassword: z.string().min(8, {
            message: "Mật khẩu phải có ít nhất 8 ký tự.",
        }),
        newPassword: z.string().min(8, {
            message: "Mật khẩu phải có ít nhất 8 ký tự.",
        }),
        confirmNewPassword: z.string().min(8, {
            message: "Mật khẩu phải có ít nhất 8 ký tự.",
        }),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Mật khẩu không khớp",
        path: ["confirmNewPassword"],
    })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function SecurityForm() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { mutate: changePassword, isPending } = useChangePassword(() => {
        form.reset()
    })

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    function onSubmit(data: PasswordFormValues) {
        changePassword(data)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mật khẩu</CardTitle>
                <CardDescription>Thay đổi mật khẩu để bảo vệ tài khoản của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input type={showCurrentPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            <span className="sr-only">{showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu mới</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            <span className="sr-only">{showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                                        </Button>
                                    </div>
                                    <FormDescription>Mật khẩu phải có ít nhất 8 ký tự.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmNewPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            <span className="sr-only">{showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}