"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    email: z.string().email({
        message: "Vui lòng nhập địa chỉ email hợp lệ.",
    }),
})

export function ForgotPasswordForm() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false)
    const [submittedEmail, setSubmittedEmail] = React.useState<string>("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        try {
            // TODO: Gọi API reset password khi backend hỗ trợ
            // await authService.forgotPassword(values.email)

            // Giả lập delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            setSubmittedEmail(values.email)
            setIsSubmitted(true)

            toast({
                title: "Email đã được gửi",
                description: "Vui lòng kiểm tra hộp thư đến của bạn.",
            })
        } catch {
            toast({
                title: "Lỗi",
                description: "Không thể gửi email. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Success state
    if (isSubmitted) {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">Kiểm tra email của bạn</h3>
                    <p className="text-sm text-muted-foreground">
                        Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến{" "}
                        <span className="font-medium text-foreground">{submittedEmail}</span>
                    </p>
                </div>
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                        Không nhận được email? Kiểm tra thư mục spam hoặc
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsSubmitted(false)
                            form.reset()
                        }}
                    >
                        Thử lại với email khác
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="name@example.com"
                                    type="email"
                                    autoComplete="email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <div className="flex items-center">
                            <svg className="mr-3 size-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
                            </svg>
                            Đang gửi...
                        </div>
                    ) : (
                        "Gửi hướng dẫn"
                    )}
                </Button>
            </form>
        </Form>
    )
}
