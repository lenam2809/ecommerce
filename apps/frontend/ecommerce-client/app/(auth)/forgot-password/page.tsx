"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronLeft, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import authService from "@/services/auth-service"

const formSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
})

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const result = await authService.forgotPassword(values.email)
      setSuccessMessage(result.message || "Đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.")
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/login"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <div className="mb-6 space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Quên mật khẩu?
        </h1>
        <p className="text-muted-foreground">
          Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-500/15 text-green-600 border-green-500/30">
          <Mail className="h-4 w-4" color="currentColor" />
          <AlertTitle>Kiểm tra email của bạn</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!successMessage ? (
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
                      autoComplete="email"
                      className="bg-background/50 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Gửi hướng dẫn"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Button asChild className="w-full h-10" variant="outline">
          <Link href="/login">Trở lại trang đăng nhập</Link>
        </Button>
      )}
    </div>
  )
}
