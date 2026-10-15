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
      <div className="flex justify-center items-center h-96 rounded-2xl border border-line">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
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
      {/* VIP Privilege Banner */}
      <div className="relative rounded-3xl border border-line bg-gradient-to-r from-card via-surface to-brand-soft/30 p-6 md:p-8 overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-brand text-white flex items-center justify-center shadow-xs">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-h3 font-bold text-ink">Hội Viên VIP Diamond</span>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-soft text-brand text-tiny font-bold">
                  Privilege Club
                </span>
              </div>
              <p className="text-small text-ink-soft mt-1">
                Tích lũy 2.450 điểm thưởng • Miễn phí vận chuyển trọn đời cho mọi đơn hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <div className="rounded-3xl border border-line bg-card p-5 md:p-6 flex items-center gap-4 transition-all hover:border-ink/30 shadow-2xs">
          <div className="h-12 w-12 rounded-2xl bg-brand-soft flex items-center justify-center shrink-0">
            <Package className="h-6 w-6 text-brand" />
          </div>
          <div>
            <p className="text-tiny text-ink-faint font-semibold uppercase tracking-wider">Đơn hàng</p>
            <h3 className="text-h2 font-bold text-ink mt-0.5">12</h3>
            <p className="text-[11px] text-ink-soft">2 đơn đang vận chuyển</p>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-card p-5 md:p-6 flex items-center gap-4 transition-all hover:border-ink/30 shadow-2xs">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <RotateCcw className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-tiny text-ink-faint font-semibold uppercase tracking-wider">Đổi / Trả</p>
            <h3 className="text-h2 font-bold text-ink mt-0.5">1</h3>
            <p className="text-[11px] text-ink-soft">1 yêu cầu đã hoàn tất</p>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-card p-5 md:p-6 flex items-center gap-4 transition-all hover:border-ink/30 shadow-2xs">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-tiny text-ink-faint font-semibold uppercase tracking-wider">Hạng thẻ</p>
            <h3 className="text-h2 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">VIP Diamond</h3>
            <p className="text-[11px] text-ink-soft">Giảm thêm 5% mọi đơn</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line overflow-hidden bg-card shadow-xs">
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
