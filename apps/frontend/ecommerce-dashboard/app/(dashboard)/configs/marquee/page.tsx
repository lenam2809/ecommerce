"use client"

import { useGetMarquees, useToggleGlobalMarquee } from "@/hooks/use-marquees"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { GenericList } from "@/components/generic/generic-list"
import { Loader2, Radio } from "lucide-react"
import { marqueeListConfig } from "@/config/marquee-list-config"

export default function MarqueePage() {
    // We only need useGetMarquees to check global status
    // GenericList handles the data fetching for the table itself via useListData
    const { data: globalData, isLoading: isLoadingGlobal } = useGetMarquees()
    const { mutate: toggleGlobal, isPending: isTogglingGlobal } = useToggleGlobalMarquee()

    const isGlobalEnabled = globalData?.data?.isEnabled ?? true

    return (
        <DashboardShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quản lý Marquee</h1>
                        <p className="text-muted-foreground mt-1">
                            Quản lý các tin nhắn chạy trên thanh marquee của trang web.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Trạng thái thanh Marquee toàn cục</p>
                        <p className="text-xs text-muted-foreground">Bật hoặc tắt toàn bộ thanh Marquee trên toàn bộ website.</p>
                    </div>
                    <Button
                        variant={isGlobalEnabled ? "default" : "outline"}
                        onClick={() => toggleGlobal()}
                        disabled={isTogglingGlobal || isLoadingGlobal}
                        className="flex items-center gap-2"
                    >
                        {isTogglingGlobal || isLoadingGlobal ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Radio className="h-4 w-4" />
                        )}
                        {isGlobalEnabled ? "Đang Bật" : "Đang Tắt"}
                    </Button>
                </div>

                {/* Main List */}
                <GenericList config={marqueeListConfig} />
            </div>
        </DashboardShell>
    )
}
