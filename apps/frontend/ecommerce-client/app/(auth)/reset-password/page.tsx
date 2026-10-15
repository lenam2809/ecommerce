"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: "Password must include uppercase, lowercase, number, and special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password confirmation does not match.",
    path: ["confirmPassword"],
  })

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId") ?? ""

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!requestId) {
      setErrorMessage("Invalid or expired link")
    }
  }, [requestId])

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
      if (!requestId) {
        throw new Error("Invalid or expired link")
      }

      await authService.verifyResetPasswordRequest(requestId)
      await authService.confirmResetPassword(values.password)

      setSuccessMessage("Your password has been updated. Please login with the new password.")

      setTimeout(() => {
        router.push("/login?reset=success")
      }, 3000)
    } catch (error: unknown) {
      const maybeError = error as { response?: { data?: { error?: string; message?: string } } }
      const apiError =
        maybeError.response?.data?.error ||
        maybeError.response?.data?.message ||
        "Invalid or expired link"
      setErrorMessage(apiError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 w-full text-left shadow-xs">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-[11px] font-bold uppercase tracking-wider mb-3">
          <span>Bảo mật tài khoản</span>
        </div>
        <h1 className="text-h2 font-bold tracking-tight text-ink mb-1.5">
          Tạo mật khẩu mới
        </h1>
        <p className="text-ink-soft text-small">
          Nhập mật khẩu mới an toàn để bảo vệ tài khoản của bạn.
        </p>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 rounded-2xl">
          <KeyRound className="h-4 w-4" color="currentColor" />
          <AlertTitle className="font-semibold text-small">Thành công</AlertTitle>
          <AlertDescription className="text-tiny mt-1">{successMessage} Đang chuyển hướng...</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6 rounded-2xl">
          <AlertTitle className="font-semibold text-small">Lỗi</AlertTitle>
          <AlertDescription className="text-tiny mt-1">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!successMessage && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-tiny font-semibold text-ink-soft ml-1">Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11 px-4 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-tiny ml-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-tiny font-semibold text-ink-soft ml-1">Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11 px-4 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-tiny ml-2" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-small font-semibold rounded-full bg-brand text-white hover:bg-brand-hover shadow-xs hover:shadow-brand-glow transition-all cursor-pointer mt-2"
              disabled={isSubmitting || !requestId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Xác nhận đổi mật khẩu"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
