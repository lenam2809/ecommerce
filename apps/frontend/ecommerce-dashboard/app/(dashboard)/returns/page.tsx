"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReturnList } from "@/components/returns/return-list"
import { returnService } from "@/services/return-service"
import { ReturnRequestList, EReturnStatus, getReturnStatusName } from "@/types/return-request"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

const STATUS_TABS = [
    { value: "all", label: "Tất cả" },
    { value: String(EReturnStatus.Requested), label: getReturnStatusName(EReturnStatus.Requested) },
    { value: String(EReturnStatus.UnderReview), label: getReturnStatusName(EReturnStatus.UnderReview) },
    { value: String(EReturnStatus.Approved), label: getReturnStatusName(EReturnStatus.Approved) },
    { value: String(EReturnStatus.Rejected), label: getReturnStatusName(EReturnStatus.Rejected) },
    { value: String(EReturnStatus.Completed), label: getReturnStatusName(EReturnStatus.Completed) },
]

export default function ReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequestList[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")

    const fetchReturns = async (status?: EReturnStatus) => {
        setLoading(true)
        try {
            const result = await returnService.getAllReturns(status)
            if (result.success && result.data) {
                setReturns(result.data)
            } else {
                setReturns([])
            }
        } catch {
            toast({ title: "Lỗi", description: "Không thể tải danh sách đổi/trả", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReturns()
    }, [])

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        if (value === "all") {
            fetchReturns()
        } else {
            fetchReturns(Number(value) as EReturnStatus)
        }
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Đổi/Trả hàng"
                text="Quản lý các yêu cầu đổi trả hàng từ khách hàng."
            />

            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                    {STATUS_TABS.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeTab}>
                    <ReturnList items={returns} loading={loading} />
                </TabsContent>
            </Tabs>
        </DashboardShell>
    )
}
