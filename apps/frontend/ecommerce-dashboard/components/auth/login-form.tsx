"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
  password: z.string().min(8, {
    message: "Mật khẩu phải có ít nhất 8 ký tự.",
  }),
  rememberMe: z.boolean(),
})

function getSafeReturnUrl(returnUrl: string | null): string {
  if (!returnUrl) return "/dashboard"

  try {
    const decoded = decodeURIComponent(returnUrl)
    return decoded.startsWith("/") && !decoded.startsWith("//") ? decoded : "/dashboard"
  } catch {
    return "/dashboard"
  }
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  // Get redirect URL from query params - support both 'returnUrl' and 'redirect'
  const redirectUrl = getSafeReturnUrl(searchParams.get("returnUrl") || searchParams.get("redirect"))

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await login(values.email, values.password)

      // Lưu preference nếu "Ghi nhớ đăng nhập" được chọn
      if (values.rememberMe) {
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("savedEmail", values.email)
      } else {
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("savedEmail")
      }

      // Redirect to the requested page or default dashboard
      router.push(redirectUrl)
    } catch (error) {
      toast({
        title: "Thất bại",
        description: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại." + error,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load saved email nếu có Remember Me
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail")
    const rememberMe = localStorage.getItem("rememberMe")
    if (rememberMe === "true" && savedEmail) {
      form.setValue("email", savedEmail)
      form.setValue("rememberMe", true)
    }
  }, [form])

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
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
            )}
          />
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center">
              <svg className="mr-3 size-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4" strokeLinecap="round"></circle>
              </svg>
              Đang đăng nhập...
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>
    </Form>
  )
}

