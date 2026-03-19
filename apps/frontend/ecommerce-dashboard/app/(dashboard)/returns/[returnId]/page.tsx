"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReturnDetail } from "@/components/returns/return-detail"
import { returnService } from "@/services/return-service"
import { ReturnRequest } from "@/types/return-request"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"

export default function ReturnDetailPage() {
    const params = useParams()
    const router = useRouter()
    const returnId = params.returnId as string
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchDetail = async () => {
        setLoading(true)
        try {
            const result = await returnService.getReturnById(returnId)
            if (result.success && result.data) {
                setReturnRequest(result.data)
            } else {
                toast({ title: "Lỗi", description: result.error || "Không tìm thấy", variant: "destructive" })
            }
        } catch {
            toast({ title: "Lỗi", description: "Không thể tải chi tiết", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (returnId) fetchDetail()
    }, [returnId])

    const handleActionComplete = () => {
        fetchDetail() // Refresh after approve/reject/update
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading={returnRequest ? `Yêu cầu ${returnRequest.code}` : "Chi tiết đổi/trả"}
                text="Xem và xử lý yêu cầu đổi trả hàng."
            >
                <Button variant="outline" size="sm" onClick={() => router.push("/returns")}>
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
            </DashboardHeader>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            )}

            {!loading && returnRequest && (
                <ReturnDetail
                    returnRequest={returnRequest}
                    onActionComplete={handleActionComplete}
                />
            )}
        </DashboardShell>
    )
}
