// app/(routes)/account/page.tsx
"use client"

import { ProfileTab } from "@/components/account/profile-tab"
import { useUser } from "@/hooks/use-user"
import { useEffect, useState } from "react"
import { User } from "@/types/user"
import { FormUpdateUserSchema } from "@/schemas/user-schema"
import { Loader2, Package, RotateCcw, Award } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AccountPage() {
  const { user, isLoading: isLoadingUser, error: userError, updateUser, isUpdatingUser } = useUser()

  const [userData, setUserData] = useState<User>({
    id: user?.id || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    phoneNumber: user?.phoneNumber || ""
  })

  const handleSubmit = async (data: FormUpdateUserSchema) => {
    updateUser(data)
  }

  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    if (!isLoadingUser && user) {
      setUserData({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber
      })
      setInitialLoad(false)
    }
  }, [isLoadingUser, user])

  if (initialLoad) {
    return (
      <div className="flex justify-center items-center h-96 glass-card rounded-3xl border-border/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (userError) {
    return (
      <div className="flex justify-center items-center h-full">
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin người dùng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border-border/50 flex flex-col justify-center items-center text-center space-y-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Package className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Tổng Đơn Hàng</p>
              <h3 className="text-3xl font-bold">12</h3>
          </div>
          <div className="glass-card rounded-3xl p-6 border-border/50 flex flex-col justify-center items-center text-center space-y-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                  <RotateCcw className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Đổi trả cần xử lý</p>
              <h3 className="text-3xl font-bold">1</h3>
          </div>
          <div className="glass-card rounded-3xl p-6 border-border/50 flex flex-col justify-center items-center text-center space-y-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Hạng thành viên</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-500">Gold</h3>
          </div>
      </div>

      <div className="glass-card rounded-3xl p-8 border-border/50 min-h-[500px]">
        <ProfileTab
          userData={userData}
          isLoadingUser={isLoadingUser}
          isUpdatingUser={isUpdatingUser}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}