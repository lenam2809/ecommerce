"use client"

import { useState } from "react"
import {
    ReturnRequest, EReturnStatus,
    getReturnStatusName, getReturnStatusColor,
    getReturnTypeName, getReturnReasonName,
} from "@/types/return-request"
import { returnService } from "@/services/return-service"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    IconCheck, IconX, IconArrowRight,
    IconPhoto, IconVideo,
} from "@tabler/icons-react"

interface ReturnDetailProps {
    returnRequest: ReturnRequest
    onActionComplete: () => void
}

export function ReturnDetail({ returnRequest, onActionComplete }: ReturnDetailProps) {
    const [showApprove, setShowApprove] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [approveAmount, setApproveAmount] = useState(returnRequest.refundAmount)
    const [approveNote, setApproveNote] = useState("")
    const [rejectReason, setRejectReason] = useState("")
    const [loading, setLoading] = useState(false)

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    const handleApprove = async () => {
        setLoading(true)
        try {
            const result = await returnService.approve(returnRequest.id, {
                staffNote: approveNote || undefined,
                finalRefundAmount: approveAmount,
            })
            if (result.success) {
                toast({ title: "Thành công", description: "Đã duyệt yêu cầu đổi/trả." })
                setShowApprove(false)
                onActionComplete()
            } else {
                const prodMsg = "Something went wrong, please try again later"
                const devMsg = result.error
                toast({
                    title: "Lỗi",
                    description: process.env.NODE_ENV === "development" ? devMsg : prodMsg,
                    variant: "destructive",
                })
            }
        } catch {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast({ title: "Lỗi", description: "Vui lòng nhập lý do từ chối", variant: "destructive" })
            return
        }
        setLoading(true)
        try {
            const result = await returnService.reject(returnRequest.id, {
                rejectionReason: rejectReason,
            })
            if (result.success) {
                toast({ title: "Thành công", description: "Đã từ chối yêu cầu đổi/trả." })
                setShowReject(false)
                onActionComplete()
            } else {
                const prodMsg = "Something went wrong, please try again later"
                const devMsg = result.error
                toast({
                    title: "Lỗi",
                    description: process.env.NODE_ENV === "development" ? devMsg : prodMsg,
                    variant: "destructive",
                })
            }
        } catch {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAdvanceStatus = async (newStatus: EReturnStatus) => {
        setLoading(true)
        try {
            const result = await returnService.updateStatus(returnRequest.id, { newStatus })
            if (result.success) {
                toast({ title: "Thành công", description: `Đã chuyển sang: ${getReturnStatusName(newStatus)}` })
                onActionComplete()
            } else {
                const prodMsg = "Something went wrong, please try again later"
                const devMsg = result.error
                toast({
                    title: "Lỗi",
                    description: process.env.NODE_ENV === "development" ? devMsg : prodMsg,
                    variant: "destructive",
                })
            }
        } catch {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const canApproveOrReject = [EReturnStatus.Requested, EReturnStatus.UnderReview].includes(returnRequest.status)

    // Determine next status for workflow
    const getNextStatuses = (): { label: string; status: EReturnStatus }[] => {
        switch (returnRequest.status) {
            case EReturnStatus.Approved:
                return [{ label: "Xác nhận nhận hàng", status: EReturnStatus.ItemReceived }]
            case EReturnStatus.ItemReceived:
                return [{ label: "Bắt đầu kiểm tra", status: EReturnStatus.QualityCheck }]
            case EReturnStatus.QualityCheck:
                return returnRequest.type === 0
                    ? [{ label: "Bắt đầu hoàn tiền", status: EReturnStatus.RefundProcessing }]
                    : [{ label: "Bắt đầu đổi hàng", status: EReturnStatus.ExchangeProcessing }]
            case EReturnStatus.RefundProcessing:
            case EReturnStatus.ExchangeProcessing:
                return [{ label: "Hoàn tất", status: EReturnStatus.Completed }]
            default:
                return []
        }
    }

    return (
        <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Thông tin yêu cầu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mã yêu cầu</span>
                            <span className="font-mono font-medium">{returnRequest.code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Loại</span>
                            <Badge variant="outline">{getReturnTypeName(returnRequest.type)}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Lý do</span>
                            <span>{getReturnReasonName(returnRequest.reason)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trạng thái</span>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getReturnStatusColor(returnRequest.status)}`}>
                                {getReturnStatusName(returnRequest.status)}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số lượng</span>
                            <span className="font-medium">{returnRequest.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số tiền hoàn</span>
                            <span className="font-semibold text-primary">{formatCurrency(returnRequest.refundAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày tạo</span>
                            <span>{new Date(returnRequest.createdAt).toLocaleString("vi-VN")}</span>
                        </div>
                        {returnRequest.resolvedAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày xử lý</span>
                                <span>{new Date(returnRequest.resolvedAt).toLocaleString("vi-VN")}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Thông tin khách hàng & đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Khách hàng</span>
                            <span className="font-medium">{returnRequest.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span>{returnRequest.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mã đơn hàng</span>
                            <span className="font-mono">{returnRequest.orderCode}</span>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground block mb-1">Ghi chú khách hàng</span>
                            <p className="bg-muted/50 rounded-md p-3 text-sm">{returnRequest.customerNote || "Không có"}</p>
                        </div>
                        {returnRequest.staffNote && (
                            <div>
                                <span className="text-muted-foreground block mb-1">Ghi chú nhân viên</span>
                                <p className="bg-blue-50 dark:bg-blue-950 rounded-md p-3 text-sm">{returnRequest.staffNote}</p>
                            </div>
                        )}
                        {returnRequest.rejectionReason && (
                            <div>
                                <span className="text-muted-foreground block mb-1">Lý do từ chối</span>
                                <p className="bg-red-50 dark:bg-red-950 rounded-md p-3 text-sm">{returnRequest.rejectionReason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Evidence */}
            {returnRequest.evidences.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Bằng chứng ({returnRequest.evidences.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {returnRequest.evidences.map((e) => (
                                <div key={e.id} className="relative group">
                                    {e.fileType === 0 ? (
                                        <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                                            <img src={e.fileUrl} alt={e.description || "Evidence"} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="aspect-square rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                                            <IconVideo className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    {e.description && <p className="text-xs text-muted-foreground mt-1 truncate">{e.description}</p>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Status Timeline */}
            {returnRequest.statusHistory.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Lịch sử trạng thái</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {returnRequest.statusHistory.map((h, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-1 h-3 w-3 rounded-full border-2 ${idx === 0 ? "bg-primary border-primary" : "bg-muted border-muted-foreground/30"}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{getReturnStatusName(h.status)}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(h.changedAt).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                        {h.note && <p className="text-sm text-muted-foreground mt-0.5">{h.note}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                {canApproveOrReject && (
                    <>
                        <Button onClick={() => setShowApprove(true)} disabled={loading}>
                            <IconCheck className="mr-2 h-4 w-4" /> Duyệt
                        </Button>
                        <Button variant="destructive" onClick={() => setShowReject(true)} disabled={loading}>
                            <IconX className="mr-2 h-4 w-4" /> Từ chối
                        </Button>
                    </>
                )}
                {getNextStatuses().map((ns) => (
                    <Button
                        key={ns.status}
                        variant="secondary"
                        onClick={() => handleAdvanceStatus(ns.status)}
                        disabled={loading}
                    >
                        <IconArrowRight className="mr-2 h-4 w-4" /> {ns.label}
                    </Button>
                ))}
            </div>

            {/* Approve Modal */}
            <Dialog open={showApprove} onOpenChange={setShowApprove}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duyệt yêu cầu đổi/trả</DialogTitle>
                        <DialogDescription>Xác nhận duyệt và điều chỉnh số tiền hoàn nếu cần.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Số tiền hoàn (VNĐ)</Label>
                            <Input
                                type="number"
                                value={approveAmount}
                                onChange={(e) => setApproveAmount(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ghi chú (tùy chọn)</Label>
                            <Textarea value={approveNote} onChange={(e) => setApproveNote(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApprove(false)}>Hủy</Button>
                        <Button onClick={handleApprove} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Xác nhận duyệt"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối yêu cầu đổi/trả</DialogTitle>
                        <DialogDescription>Nhập lý do từ chối yêu cầu.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Lý do từ chối *</Label>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReject(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
