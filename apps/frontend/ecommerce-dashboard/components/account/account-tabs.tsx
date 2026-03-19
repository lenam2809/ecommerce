"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileForm from "./profile-form"
import SecurityForm from "./security-form"
import ActivityHistory from "./activity-history"
import NotificationSettings from "./notification-settings"
import PrivacySettings from "./privacy-settings"
import { useGetProfile } from "@/hooks/use-account"
import { Skeleton } from "@/components/ui/skeleton"

export default function AccountTabs() {
  const { data: profile, isLoading } = useGetProfile()

  if (isLoading) {
    return <AccountTabsSkeleton />
  }

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList className="flex w-full gap-2 overflow-x-auto md:grid md:grid-cols-5">
        <TabsTrigger className="flex-1 whitespace-nowrap md:flex-none" value="profile">Thông tin cá nhân</TabsTrigger>
        <TabsTrigger className="flex-1 whitespace-nowrap md:flex-none" value="security">Bảo mật</TabsTrigger>
        <TabsTrigger className="flex-1 whitespace-nowrap md:flex-none" value="activity">Hoạt động</TabsTrigger>
        <TabsTrigger className="flex-1 whitespace-nowrap md:flex-none" value="notifications">Thông báo</TabsTrigger>
        <TabsTrigger className="flex-1 whitespace-nowrap md:flex-none" value="privacy">Quyền riêng tư</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <ProfileForm initialData={profile?.data} />
      </TabsContent>
      <TabsContent value="security" className="space-y-4">
        <SecurityForm />
      </TabsContent>
      <TabsContent value="activity" className="space-y-4">
        <ActivityHistory initialData={profile?.data} />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="privacy" className="space-y-4">
        <PrivacySettings />
      </TabsContent>
    </Tabs>
  )
}

function AccountTabsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
