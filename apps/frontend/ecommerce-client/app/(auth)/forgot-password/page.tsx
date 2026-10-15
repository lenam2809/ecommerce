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

function getApiErrorMessage(error: unknown) {
  const maybeError = error as { response?: { data?: { message?: string } } }
  return maybeError.response?.data?.message
}

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
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(error) ||
          "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 w-full text-left shadow-xs">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center text-tiny font-medium text-ink-soft hover:text-brand transition-colors"
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          <span>Quay lại đăng nhập</span>
        </Link>
      </div>

      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-[11px] font-bold uppercase tracking-wider mb-3">
          <span>Khôi phục tài khoản</span>
        </div>
        <h1 className="text-h2 font-bold tracking-tight text-ink mb-1.5">
          Quên mật khẩu?
        </h1>
        <p className="text-ink-soft text-small">
          Nhập email đăng ký của bạn. Chúng tôi sẽ gửi liên kết để thiết lập lại mật khẩu mới.
        </p>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 rounded-2xl">
          <Mail className="h-4 w-4" color="currentColor" />
          <AlertTitle className="font-semibold text-small">Kiểm tra hộp thư của bạn</AlertTitle>
          <AlertDescription className="text-tiny mt-1">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6 rounded-2xl">
          <AlertTitle className="font-semibold text-small">Lỗi</AlertTitle>
          <AlertDescription className="text-tiny mt-1">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!successMessage ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-tiny font-semibold text-ink-soft ml-1">Email đăng ký</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="name@example.com"
                        autoComplete="email"
                        className="h-11 pl-10 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-tiny ml-2" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-small font-semibold rounded-full bg-brand text-white hover:bg-brand-hover shadow-xs hover:shadow-brand-glow transition-all cursor-pointer mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                "Gửi liên kết khôi phục"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Button asChild className="w-full h-11 rounded-full border-line text-ink font-semibold text-small hover:bg-surface" variant="outline">
          <Link href="/login">Trở lại trang đăng nhập</Link>
        </Button>
      )}
    </div>
  )
}
