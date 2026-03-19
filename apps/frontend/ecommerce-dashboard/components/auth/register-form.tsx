"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Tên phải có ít nhất 2 ký tự.",
    }),
    email: z.string().email({
      message: "Vui lòng nhập địa chỉ email hợp lệ.",
    }),
    phone: z
      .string()
      .min(10, { message: "Số điện thoại phải có ít nhất 10 chữ số." })
      .regex(/^\d+$/, { message: "Số điện thoại chỉ được chứa chữ số." }),
    password: z.string().min(8, {
      message: "Mật khẩu phải có ít nhất 8 ký tự.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Mật khẩu xác nhận phải có ít nhất 8 ký tự.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  })

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await register(values.name, values.email, values.phone, values.password, values.confirmPassword)
      toast({
        title: "Thành công",
        description: "Tài khoản của bạn đã được tạo.",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi. Vui lòng thử lại." + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input placeholder="Nguyễn Văn A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="ten@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder="0123456789" {...field} />
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xác nhận mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>
    </Form>
  )
}
