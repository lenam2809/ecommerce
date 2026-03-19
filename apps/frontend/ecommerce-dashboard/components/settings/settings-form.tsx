"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  })
})

const notificationsFormSchema = z.object({
  orderUpdates: z.boolean().refine((val) => val !== undefined, {
    message: "Yêu cầu chọn tùy chọn cập nhật đơn hàng.",
  }),
  newProducts: z.boolean().refine((val) => val !== undefined, {
    message: "Yêu cầu chọn tùy chọn sản phẩm mới.",
  }),
  marketingEmails: z.boolean().refine((val) => val !== undefined, {
    message: "Yêu cầu chọn tùy chọn email tiếp thị.",
  }),
  stockAlerts: z.boolean().refine((val) => val !== undefined, {
    message: "Yêu cầu chọn tùy chọn thông báo hàng tồn.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export function SettingsForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.fullName || "",
      email: user?.email || "",
    },
  })

  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      orderUpdates: true,
      newProducts: false,
      marketingEmails: true,
      stockAlerts: false,
    },
  })

  function onProfileSubmit(_data: ProfileFormValues) { // eslint-disable-line @typescript-eslint/no-unused-vars
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "Cập nhật hồ sơ thành công",
        description: "Thông tin hồ sơ của bạn đã được cập nhật.",
      })
      setIsLoading(false)
    }, 1000)
  }

  function onNotificationsSubmit(_data: NotificationsFormValues) { // eslint-disable-line @typescript-eslint/no-unused-vars
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "Cập nhật tùy chọn thông báo thành công",
        description: "Tùy chọn thông báo của bạn đã được cập nhật.",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
          <CardDescription>Cập nhật thông tin cá nhân của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên của bạn" {...field} />
                    </FormControl>
                    <FormDescription>Đây là tên hiển thị công khai của bạn.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Đây là địa chỉ email liên kết với tài khoản của bạn.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
          <CardDescription>Cấu hình cách bạn nhận thông báo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-8">
              <FormField
                control={notificationsForm.control}
                name="orderUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Cập nhật đơn hàng</FormLabel>
                      <FormDescription>Nhận thông báo về tình trạng đơn hàng của bạn.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="newProducts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Sản phẩm mới</FormLabel>
                      <FormDescription>Nhận thông báo về các sản phẩm mới.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email tiếp thị</FormLabel>
                      <FormDescription>Nhận email về các tính năng mới và ưu đãi đặc biệt.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationsForm.control}
                name="stockAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Thông báo hàng tồn</FormLabel>
                      <FormDescription>Nhận thông báo khi sản phẩm có hàng trở lại.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu tùy chọn"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}