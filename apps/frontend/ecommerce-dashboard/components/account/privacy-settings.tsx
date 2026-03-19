"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Lock, Shield, Eye, EyeOff } from "lucide-react"

export default function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    activityVisibility: "friends",
    searchable: true,
    dataCollection: true,
    twoFactorAuth: false,
  })

  const handleSavePrivacySettings = () => {
    toast({
      title: "Cài đặt riêng tư",
      description: "Cài đặt riêng tư của bạn đã được cập nhật thành công.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Cài đặt riêng tư
        </CardTitle>
        <CardDescription>Kiểm soát tuỳ chọn riêng tư và bảo mật của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hiển thị hồ sơ</h3>
          <RadioGroup
            value={privacySettings.profileVisibility}
            onValueChange={(value) =>
              setPrivacySettings((prev) => ({ ...prev, profileVisibility: value }))
            }
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="public" id="public" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="public" className="font-medium">
                  Công khai
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mọi người có thể xem thông tin hồ sơ của bạn.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="friends" id="friends" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="friends" className="font-medium">
                  Chỉ bạn bè
                </Label>
                <p className="text-sm text-muted-foreground">
                  Chỉ những người bạn đã kết nối có thể xem hồ sơ của bạn.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private" id="private" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="private" className="font-medium">
                  Riêng tư
                </Label>
                <p className="text-sm text-muted-foreground">
                  Hồ sơ của bạn được ẩn với tất cả mọi người trừ bạn.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hiển thị hoạt động</h3>
          <RadioGroup
            value={privacySettings.activityVisibility}
            onValueChange={(value) =>
              setPrivacySettings((prev) => ({ ...prev, activityVisibility: value }))
            }
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="public" id="activity-public" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="activity-public" className="font-medium">
                  Công khai
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mọi người có thể xem hoạt động và tương tác của bạn.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="friends" id="activity-friends" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="activity-friends" className="font-medium">
                  Chỉ bạn bè
                </Label>
                <p className="text-sm text-muted-foreground">
                  Chỉ bạn bè có thể xem hoạt động của bạn.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private" id="activity-private" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="activity-private" className="font-medium">
                  Ẩn hoạt động
                </Label>
                <p className="text-sm text-muted-foreground">
                  Hoạt động của bạn được ẩn với tất cả mọi người trừ bạn.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tuỳ chọn bảo mật</h3>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="searchable" className="flex flex-col space-y-1">
              <span className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Cho phép tìm kiếm
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Cho phép mọi người tìm thấy bạn qua tìm kiếm.
              </span>
            </Label>
            <Switch
              id="searchable"
              checked={privacySettings.searchable}
              onCheckedChange={(checked) =>
                setPrivacySettings((prev) => ({ ...prev, searchable: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="data-collection" className="flex flex-col space-y-1">
              <span className="flex items-center">
                <EyeOff className="mr-2 h-4 w-4" />
                Thu thập dữ liệu
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Cho phép chúng tôi thu thập dữ liệu sử dụng để cải thiện trải nghiệm.
              </span>
            </Label>
            <Switch
              id="data-collection"
              checked={privacySettings.dataCollection}
              onCheckedChange={(checked) =>
                setPrivacySettings((prev) => ({ ...prev, dataCollection: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="two-factor" className="flex flex-col space-y-1">
              <span className="flex items-center">
                <Lock className="mr-2 h-4 w-4" />
                Xác thực hai yếu tố
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                Thêm một lớp bảo mật cho tài khoản của bạn.
              </span>
            </Label>
            <Switch
              id="two-factor"
              checked={privacySettings.twoFactorAuth}
              onCheckedChange={(checked) =>
                setPrivacySettings((prev) => ({ ...prev, twoFactorAuth: checked }))
              }
            />
          </div>
        </div>

        <Button onClick={handleSavePrivacySettings} className="w-full sm:w-auto">
          Lưu cài đặt riêng tư
        </Button>
      </CardContent>
    </Card>
  )
}
