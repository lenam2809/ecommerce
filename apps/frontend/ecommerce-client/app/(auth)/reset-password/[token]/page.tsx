"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, KeyRound } from "lucide-react"
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

const formSchema = z
  .object({
    password: z.string().min(8, {
      message: "Mật khẩu phải có ít nhất 8 ký tự.",
    }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp.",
    path: ["confirmPassword"],
  })

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      if (!token) throw new Error("Token không hợp lệ hoặc đã thiếu.")

      const payload = {
        token: token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      }

      await authService.resetPassword(payload)
      setSuccessMessage("Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập bằng mật khẩu mới.")
      
      // Chuyển hướng sang trang login sau 3 giây
      setTimeout(() => {
        router.push("/login?reset=success")
      }, 3000)

    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Mã token không hợp lệ hoặc đã hết hạn."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Tạo mật khẩu mới
        </h1>
        <p className="text-muted-foreground">
          Vui lòng nhập mật khẩu mới đầy đủ ký tự đặc biệt theo yêu cầu bên dưới để bảo vệ tài khoản tốt hơn.
        </p>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-500/15 text-green-600 border-green-500/30">
          <KeyRound className="h-4 w-4" color="currentColor" />
          <AlertTitle>Đặt lại thành công</AlertTitle>
          <AlertDescription>{successMessage} Đang chuyển hướng...</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Ẩn form nếu thành công */}
      {!successMessage && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="bg-background/50 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="bg-background/50 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-10 mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang thiết lập...
                </>
              ) : (
                "Xác nhận mật khẩu"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
