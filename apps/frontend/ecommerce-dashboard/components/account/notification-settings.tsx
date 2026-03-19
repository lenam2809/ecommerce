"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Bell, Mail } from "lucide-react"

export default function NotificationSettings() {
  const [emailSettings, setEmailSettings] = useState({
    accountUpdates: true,
    newFeatures: true,
    marketingEmails: false,
    securityAlerts: true,
  })

  const [pushSettings, setPushSettings] = useState({
    accountActivity: true,
    newMessages: true,
    reminders: true,
    securityAlerts: true,
  })

  const handleSaveEmailSettings = () => {
    toast({
      title: "Thông báo Email",
      description: "Tuỳ chọn thông báo qua email của bạn đã được lưu.",
    })
  }

  const handleSavePushSettings = () => {
    toast({
      title: "Thông báo Push",
      description: "Tuỳ chọn thông báo push của bạn đã được lưu.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tuỳ chọn thông báo</CardTitle>
        <CardDescription>Quản lý cách bạn nhận thông báo và cập nhật.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="space-y-4">
          <TabsList>
            <TabsTrigger value="email" className="flex items-center whitespace-nowrap">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="push" className="flex items-center whitespace-nowrap">
              <Bell className="mr-2 h-4 w-4" />
              Push
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="account-updates" className="flex flex-col space-y-1">
                  <span>Cập nhật tài khoản</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận email về hoạt động và bảo mật tài khoản của bạn.
                  </span>
                </Label>
                <Switch
                  id="account-updates"
                  checked={emailSettings.accountUpdates}
                  onCheckedChange={(checked) =>
                    setEmailSettings((prev) => ({ ...prev, accountUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="new-features" className="flex flex-col space-y-1">
                  <span>Tính năng mới</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận email về tính năng và cải tiến mới.
                  </span>
                </Label>
                <Switch
                  id="new-features"
                  checked={emailSettings.newFeatures}
                  onCheckedChange={(checked) =>
                    setEmailSettings((prev) => ({ ...prev, newFeatures: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                  <span>Email tiếp thị</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận email về khuyến mãi, sự kiện và sản phẩm mới.
                  </span>
                </Label>
                <Switch
                  id="marketing-emails"
                  checked={emailSettings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setEmailSettings((prev) => ({ ...prev, marketingEmails: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="security-alerts-email" className="flex flex-col space-y-1">
                  <span>Cảnh báo bảo mật</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận email khi có hoạt động đáng ngờ và các cảnh báo bảo mật quan trọng.
                  </span>
                </Label>
                <Switch
                  id="security-alerts-email"
                  checked={emailSettings.securityAlerts}
                  onCheckedChange={(checked) =>
                    setEmailSettings((prev) => ({ ...prev, securityAlerts: checked }))
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveEmailSettings}>Lưu tuỳ chọn email</Button>
          </TabsContent>

          <TabsContent value="push" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="account-activity" className="flex flex-col space-y-1">
                  <span>Hoạt động tài khoản</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận thông báo khi có hoạt động quan trọng trên tài khoản của bạn.
                  </span>
                </Label>
                <Switch
                  id="account-activity"
                  checked={pushSettings.accountActivity}
                  onCheckedChange={(checked) =>
                    setPushSettings((prev) => ({ ...prev, accountActivity: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="new-messages" className="flex flex-col space-y-1">
                  <span>Tin nhắn mới</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận thông báo khi bạn có tin nhắn mới.
                  </span>
                </Label>
                <Switch
                  id="new-messages"
                  checked={pushSettings.newMessages}
                  onCheckedChange={(checked) =>
                    setPushSettings((prev) => ({ ...prev, newMessages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="reminders" className="flex flex-col space-y-1">
                  <span>Nhắc nhở</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận thông báo về sự kiện và công việc sắp tới.
                  </span>
                </Label>
                <Switch
                  id="reminders"
                  checked={pushSettings.reminders}
                  onCheckedChange={(checked) =>
                    setPushSettings((prev) => ({ ...prev, reminders: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="security-alerts-push" className="flex flex-col space-y-1">
                  <span>Cảnh báo bảo mật</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Nhận thông báo về hoạt động đáng ngờ và các vấn đề bảo mật.
                  </span>
                </Label>
                <Switch
                  id="security-alerts-push"
                  checked={pushSettings.securityAlerts}
                  onCheckedChange={(checked) =>
                    setPushSettings((prev) => ({ ...prev, securityAlerts: checked }))
                  }
                />
              </div>
            </div>

            <Button onClick={handleSavePushSettings}>Lưu tuỳ chọn thông báo push</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
