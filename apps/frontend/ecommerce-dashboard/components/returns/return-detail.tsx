"use client"

import { useState } from "react"
import {
    ReturnRequest,
    EReturnStatus,
    getReturnStatusName,
    getReturnStatusColor,
    getReturnTypeName,
    getReturnReasonName,
    RMA_5_STEPS,
} from "@/types/return-request"
import { returnService } from "@/services/return-service"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    IconCheck,
    IconX,
    IconArrowRight,
    IconVideo,
    IconDeviceMobile,
    IconBuildingStore,
    IconUserCheck,
    IconClock,
    IconClipboardList,
    IconShieldCheck,
    IconHistory,
    IconBarcode,
    IconPhone,
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

    // Form nhật ký kỹ thuật viên
    const [logStep, setLogStep] = useState<number>(3)
    const [logTitle, setLogTitle] = useState("")
    const [logActorName, setLogActorName] = useState(returnRequest.assignedTechnicianName || "")
    const [logLocation, setLogLocation] = useState(returnRequest.showroomName || "Showroom ShopViet")
    const [logNote, setLogNote] = useState("")
    const [logSerial, setLogSerial] = useState(returnRequest.serialNumber || "")
    const [logProcessingMethod, setLogProcessingMethod] = useState(
        returnRequest.processingMethod || "Đổi lấy ngay 15 phút tại Showroom"
    )
    const [submittingLog, setSubmittingLog] = useState(false)

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    // Xác định bước hiện tại trong tiến trình 5 bước RMA
    const getCurrentStep = (): number => {
        if (returnRequest.timelineSteps && returnRequest.timelineSteps.length > 0) {
            const activeStep = returnRequest.timelineSteps.find((s) => s.status === "Active")
            if (activeStep) return activeStep.step
            const completedSteps = returnRequest.timelineSteps.filter((s) => s.status === "Completed")
            if (completedSteps.length > 0) {
                return Math.min(5, Math.max(...completedSteps.map((s) => s.step)) + 1)
            }
        }

        switch (returnRequest.status) {
            case EReturnStatus.Requested:
                return 1
            case EReturnStatus.UnderReview:
            case EReturnStatus.Approved:
            case EReturnStatus.ItemReceived:
                return 2
            case EReturnStatus.QualityCheck:
                return 3
            case EReturnStatus.RefundProcessing:
            case EReturnStatus.ExchangeProcessing:
                return 4
            case EReturnStatus.Completed:
                return 5
            case EReturnStatus.Rejected:
                return 2
            default:
                return 1
        }
    }

    const currentStep = getCurrentStep()

    const handleApprove = async () => {
        setLoading(true)
        try {
            const result = await returnService.approve(returnRequest.id, {
                staffNote: approveNote || undefined,
                finalRefundAmount: approveAmount,
            })
            if (result.success) {
                toast({ title: "Thành công", description: "Đã duyệt yêu cầu đổi/trả RMA." })
                setShowApprove(false)
                onActionComplete()
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Có lỗi xảy ra khi duyệt yêu cầu.",
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
                toast({
                    title: "Lỗi",
                    description: result.error || "Có lỗi xảy ra khi từ chối yêu cầu.",
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
                toast({
                    title: "Lỗi",
                    description: result.error || "Có lỗi xảy ra khi chuyển trạng thái.",
                    variant: "destructive",
                })
            }
        } catch {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAddLog = async () => {
        if (!logTitle.trim()) {
            toast({ title: "Lỗi", description: "Vui lòng nhập tiêu đề nhật ký kiểm định.", variant: "destructive" })
            return
        }

        setSubmittingLog(true)
        try {
            const result = await returnService.addReturnLog(returnRequest.id, {
                step: logStep,
                title: logTitle.trim(),
                actorName: logActorName.trim() || undefined,
                location: logLocation.trim() || undefined,
                note: logNote.trim() || undefined,
                serialNumber: logSerial.trim() || undefined,
                processingMethod: logProcessingMethod.trim() || undefined,
                assignedTechnicianName: logActorName.trim() || undefined,
            })

            if (result.success) {
                toast({
                    title: "Thành công",
                    description: `Đã ghi nhận nhật ký Bước ${logStep} thành công!`,
                })
                setLogTitle("")
                setLogNote("")
                onActionComplete()
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể ghi nhận nhật ký kiểm định.",
                    variant: "destructive",
                })
            }
        } catch {
            toast({ title: "Lỗi", description: "Có lỗi xảy ra khi ghi nhận nhật ký.", variant: "destructive" })
        } finally {
            setSubmittingLog(false)
        }
    }

    const canApproveOrReject = [EReturnStatus.Requested, EReturnStatus.UnderReview].includes(returnRequest.status)

    // Xác định các trạng thái tiếp theo trong quy trình
    const getNextStatuses = (): { label: string; status: EReturnStatus }[] => {
        switch (returnRequest.status) {
            case EReturnStatus.Approved:
                return [{ label: "Xác nhận nhận hàng tại Showroom", status: EReturnStatus.ItemReceived }]
            case EReturnStatus.ItemReceived:
                return [{ label: "Bắt đầu KTV thẩm định", status: EReturnStatus.QualityCheck }]
            case EReturnStatus.QualityCheck:
                return returnRequest.type === 0
                    ? [{ label: "Lên lệnh hoàn tiền", status: EReturnStatus.RefundProcessing }]
                    : [{ label: "Đổi máy mới 15p tại Showroom", status: EReturnStatus.ExchangeProcessing }]
            case EReturnStatus.RefundProcessing:
            case EReturnStatus.ExchangeProcessing:
                return [{ label: "Hoàn tất RMA & Đóng hồ sơ", status: EReturnStatus.Completed }]
            default:
                return []
        }
    }

    return (
        <div className="space-y-6">
            {/* Visual Stepper 5 bước RMA chuẩn SSoT 2026 */}
            <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <IconShieldCheck className="h-5 w-5 text-tech-blue" />
                                Quy trình Đổi trả RMA 5 bước Chuẩn SSoT 2026
                            </CardTitle>
                            <CardDescription>
                                Đổi máy mới nguyên seal 15 phút tại 45 Showroom hoặc thu hồi bưu cục toàn quốc
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
                            Bước hiện tại: {currentStep}/5
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                        {RMA_5_STEPS.map((s) => {
                            const isCompleted = returnRequest.status === EReturnStatus.Completed || s.step < currentStep
                            const isActive = s.step === currentStep && returnRequest.status !== EReturnStatus.Completed
                            const isPending = s.step > currentStep

                            return (
                                <div
                                    key={s.step}
                                    className={`relative p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                                        isActive
                                            ? "border-tech-blue bg-tech-blue/5 ring-1 ring-tech-blue shadow-sm"
                                            : isCompleted
                                            ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20"
                                            : "border-border bg-card/50 opacity-75"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div
                                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                isCompleted
                                                    ? "bg-emerald-600 text-white"
                                                    : isActive
                                                    ? "bg-tech-blue text-white ring-4 ring-tech-blue/20"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {isCompleted ? <IconCheck className="h-4 w-4" /> : s.step}
                                        </div>
                                        <span className="text-xs font-semibold leading-tight line-clamp-1">
                                            {s.title}
                                        </span>
                                    </div>

                                    <div className="space-y-1 mt-1 text-xs">
                                        <p className="font-medium text-foreground">{s.subtitle}</p>
                                        <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
                                            {s.description}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                                        <span className="text-muted-foreground">Trạng thái:</span>
                                        <span
                                            className={`font-medium ${
                                                isCompleted
                                                    ? "text-emerald-600"
                                                    : isActive
                                                    ? "text-tech-blue font-semibold"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {isCompleted ? "Đã duyệt" : isActive ? "Đang xử lý" : "Chờ đến lượt"}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Bảng thông tin Thiết bị & Tiếp nhận Showroom O2O */}
            <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <IconDeviceMobile className="h-5 w-5 text-brand" />
                        Thông tin Thiết bị, Serial/IMEI & Tiếp nhận Showroom O2O
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 rounded-lg border bg-surface/40 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <IconBarcode className="h-3.5 w-3.5 text-tech-blue" /> Mã Serial / IMEI thiết bị
                            </span>
                            <div className="font-mono font-semibold text-foreground truncate">
                                {returnRequest.serialNumber || (
                                    <span className="text-muted-foreground font-normal italic">Chưa gắn mã Serial</span>
                                )}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border bg-surface/40 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <IconBuildingStore className="h-3.5 w-3.5 text-tech-blue" /> Cơ sở Showroom tiếp nhận
                            </span>
                            <div className="font-medium text-foreground truncate">
                                {returnRequest.showroomName || "Hệ thống 45 Showroom công nghệ"}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                                {returnRequest.showroomAddress || "Quầy VIP tiếp nhận & đổi trả 15p"}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg border bg-surface/40 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <IconUserCheck className="h-3.5 w-3.5 text-tech-blue" /> Kỹ thuật viên thẩm định
                            </span>
                            <div className="font-medium text-foreground truncate">
                                {returnRequest.assignedTechnicianName || "Chưa phân công KTV"}
                            </div>
                            <p className="text-[11px] text-muted-foreground">KTV phần cứng ShopViet</p>
                        </div>

                        <div className="p-3 rounded-lg border bg-surface/40 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <IconClock className="h-3.5 w-3.5 text-brand" /> Phương thức xử lý
                            </span>
                            <div className="font-semibold text-brand truncate">
                                {returnRequest.processingMethod || "Đổi lấy ngay 15 phút tại Showroom"}
                            </div>
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                                <IconPhone className="h-3 w-3 text-muted-foreground" />
                                <span>Kỹ thuật: <strong className="font-mono text-foreground">1800 6869</strong></span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Ghi nhận Nhật ký Kỹ thuật viên & Thẩm định */}
            <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <IconClipboardList className="h-5 w-5 text-tech-blue" />
                        Ghi nhận Nhật ký Thẩm định & Kiểm tra Phần cứng (Kỹ thuật viên)
                    </CardTitle>
                    <CardDescription>
                        Lưu nhật ký kiểm định theo từng bước, ghi nhận kết quả đo kiểm và tình trạng linh kiện
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="log-step" className="text-xs font-semibold">
                                Bước quy trình RMA (1 - 5)
                            </Label>
                            <Select
                                value={logStep.toString()}
                                onValueChange={(val) => {
                                    const stepNum = parseInt(val, 10)
                                    setLogStep(stepNum)
                                    const stepDef = RMA_5_STEPS.find((s) => s.step === stepNum)
                                    if (stepDef && !logTitle) {
                                        setLogTitle(stepDef.expectedAction)
                                    }
                                }}
                            >
                                <SelectTrigger id="log-step">
                                    <SelectValue placeholder="Chọn bước RMA" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RMA_5_STEPS.map((s) => (
                                        <SelectItem key={s.step} value={s.step.toString()}>
                                            Bước {s.step}: {s.title.replace(/^Bước \d+:\s*/, "")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="log-title" className="text-xs font-semibold">
                                Tiêu đề công việc thẩm định *
                            </Label>
                            <Input
                                id="log-title"
                                placeholder="VD: Thẩm định mainboard, đo áp nguồn sạc..."
                                value={logTitle}
                                onChange={(e) => setLogTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="log-actor" className="text-xs font-semibold">
                                Kỹ thuật viên thực hiện
                            </Label>
                            <Input
                                id="log-actor"
                                placeholder="Họ và tên KTV"
                                value={logActorName}
                                onChange={(e) => setLogActorName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="log-serial" className="text-xs font-semibold">
                                Cập nhật Serial / IMEI thiết bị
                            </Label>
                            <Input
                                id="log-serial"
                                placeholder="Quét hoặc nhập Serial máy..."
                                value={logSerial}
                                onChange={(e) => setLogSerial(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="log-location" className="text-xs font-semibold">
                                Địa điểm thẩm định / Showroom
                            </Label>
                            <Input
                                id="log-location"
                                placeholder="Showroom ShopViet 215 Nguyễn Huệ..."
                                value={logLocation}
                                onChange={(e) => setLogLocation(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="log-method" className="text-xs font-semibold">
                                Phương thức giải quyết RMA
                            </Label>
                            <Select
                                value={logProcessingMethod}
                                onValueChange={setLogProcessingMethod}
                            >
                                <SelectTrigger id="log-method">
                                    <SelectValue placeholder="Chọn phương thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Đổi lấy ngay 15 phút tại Showroom">
                                        Đổi lấy ngay 15 phút tại Showroom (O2O VIP)
                                    </SelectItem>
                                    <SelectItem value="Lên lệnh hoàn tiền">
                                        Lên lệnh hoàn tiền qua phương thức gốc
                                    </SelectItem>
                                    <SelectItem value="Thu hồi bưu cục gửi TTBH hãng">
                                        Thu hồi bưu cục gửi TTBH hãng
                                    </SelectItem>
                                    <SelectItem value="Từ chối bảo hành do lỗi người dùng">
                                        Từ chối bảo hành (Rơi vỡ, vô nước)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="log-note" className="text-xs font-semibold">
                            Ghi chú kỹ thuật chi tiết (Lỗi linh kiện, ngoại quan, số đo kiểm...)
                        </Label>
                        <Textarea
                            id="log-note"
                            placeholder="Mô tả kết quả đo kiểm, tình trạng vỏ máy, tem niêm phong, pin, màn hình..."
                            rows={3}
                            value={logNote}
                            onChange={(e) => setLogNote(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleAddLog}
                            disabled={submittingLog || !logTitle.trim()}
                            className="bg-tech-blue hover:bg-tech-blue/90 text-white"
                        >
                            <IconShieldCheck className="mr-2 h-4 w-4" />
                            {submittingLog ? "Đang ghi nhận..." : "Ghi nhận nhật ký kiểm định"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Lịch sử Nhật ký Kỹ thuật viên đã ghi */}
            {returnRequest.logs && returnRequest.logs.length > 0 && (
                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <IconHistory className="h-5 w-5 text-tech-blue" />
                            Nhật ký Thẩm định Kỹ thuật ({returnRequest.logs.length} bản ghi)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {returnRequest.logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-3.5 rounded-lg border bg-surface/30 flex flex-col md:flex-row md:items-start justify-between gap-3 text-sm"
                                >
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="font-mono text-xs bg-tech-blue/10 text-tech-blue border-tech-blue/20">
                                                Bước {log.step}
                                            </Badge>
                                            <span className="font-semibold text-foreground">{log.title}</span>
                                            {log.processingMethod && (
                                                <Badge variant="secondary" className="text-[11px]">
                                                    {log.processingMethod}
                                                </Badge>
                                            )}
                                        </div>
                                        {log.note && (
                                            <p className="text-muted-foreground text-xs leading-relaxed bg-background/60 p-2.5 rounded border">
                                                {log.note}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                                            {log.actorName && (
                                                <span>KTV: <strong className="text-foreground">{log.actorName}</strong></span>
                                            )}
                                            {log.location && (
                                                <span>Địa điểm: <strong className="text-foreground">{log.location}</strong></span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground font-mono shrink-0">
                                        {new Date(log.loggedAt).toLocaleString("vi-VN")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Thông tin Chi tiết Yêu cầu & Đơn hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Thông tin yêu cầu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Mã yêu cầu RMA</span>
                            <span className="font-mono font-medium text-foreground">{returnRequest.code}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Loại dịch vụ</span>
                            <Badge variant="outline" className="font-medium">
                                {getReturnTypeName(returnRequest.type)}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Lý do đổi/trả</span>
                            <span className="font-medium">{getReturnReasonName(returnRequest.reason)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Trạng thái</span>
                            <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${getReturnStatusColor(returnRequest.status)}`}>
                                {getReturnStatusName(returnRequest.status)}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Số lượng</span>
                            <span className="font-medium">{returnRequest.quantity} sản phẩm</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Số tiền hoàn dự kiến</span>
                            <span className="font-mono tabular-nums whitespace-nowrap price-tag text-base font-bold text-brand">
                                {formatCurrency(returnRequest.refundAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Ngày tạo</span>
                            <span>{new Date(returnRequest.createdAt).toLocaleString("vi-VN")}</span>
                        </div>
                        {returnRequest.resolvedAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Ngày hoàn tất</span>
                                <span>{new Date(returnRequest.resolvedAt).toLocaleString("vi-VN")}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Thông tin khách hàng & đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Khách hàng</span>
                            <span className="font-medium text-foreground">{returnRequest.customerName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Email liên hệ</span>
                            <span className="font-mono text-xs">{returnRequest.customerEmail}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Mã đơn hàng gốc</span>
                            <span className="font-mono font-medium text-tech-blue">{returnRequest.orderCode}</span>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground block mb-1 text-xs font-medium">Ghi chú khách hàng</span>
                            <p className="bg-surface/50 rounded-md p-3 text-xs leading-relaxed border">
                                {returnRequest.customerNote || "Không có ghi chú thêm từ khách hàng."}
                            </p>
                        </div>
                        {returnRequest.staffNote && (
                            <div>
                                <span className="text-muted-foreground block mb-1 text-xs font-medium">Ghi chú nhân viên duyệt</span>
                                <p className="bg-tech-blue/5 rounded-md p-3 text-xs leading-relaxed border border-tech-blue/20">
                                    {returnRequest.staffNote}
                                </p>
                            </div>
                        )}
                        {returnRequest.rejectionReason && (
                            <div>
                                <span className="text-brand block mb-1 text-xs font-medium">Lý do từ chối RMA</span>
                                <p className="bg-brand/5 rounded-md p-3 text-xs leading-relaxed border border-brand/20 text-brand">
                                    {returnRequest.rejectionReason}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bằng chứng hình ảnh / video từ khách */}
            {returnRequest.evidences && returnRequest.evidences.length > 0 && (
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Hình ảnh & Video bằng chứng ({returnRequest.evidences.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {returnRequest.evidences.map((e) => (
                                <div key={e.id} className="relative group rounded-lg overflow-hidden border bg-muted">
                                    {e.fileType === 0 ? (
                                        <div className="aspect-square">
                                            <img
                                                src={e.fileUrl}
                                                alt={e.description || "Bằng chứng"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-square flex items-center justify-center">
                                            <IconVideo className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    {e.description && (
                                        <p className="p-2 text-xs text-muted-foreground truncate bg-card">
                                            {e.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lịch sử Trạng thái Hệ thống */}
            {returnRequest.statusHistory && returnRequest.statusHistory.length > 0 && (
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Lịch sử trạng thái vòng đời RMA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {returnRequest.statusHistory.map((h, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div
                                        className={`mt-1 h-3 w-3 rounded-full border-2 ${
                                            idx === 0
                                                ? "bg-tech-blue border-tech-blue ring-4 ring-tech-blue/20"
                                                : "bg-muted border-muted-foreground/30"
                                        }`}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{getReturnStatusName(h.status)}</span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {new Date(h.changedAt).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                        {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Thanh Nút Thao tác Phê duyệt & Chuyển trạng thái */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
                {canApproveOrReject && (
                    <>
                        <Button
                            onClick={() => setShowApprove(true)}
                            disabled={loading}
                            className="bg-brand hover:bg-brand/90 text-white font-medium"
                        >
                            <IconCheck className="mr-2 h-4 w-4" /> Duyệt tiếp nhận RMA
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowReject(true)}
                            disabled={loading}
                        >
                            <IconX className="mr-2 h-4 w-4" /> Từ chối yêu cầu
                        </Button>
                    </>
                )}

                {getNextStatuses().map((ns) => (
                    <Button
                        key={ns.status}
                        variant="secondary"
                        onClick={() => handleAdvanceStatus(ns.status)}
                        disabled={loading}
                        className="bg-tech-blue/10 text-tech-blue hover:bg-tech-blue/20 font-medium border border-tech-blue/20"
                    >
                        <IconArrowRight className="mr-2 h-4 w-4" /> {ns.label}
                    </Button>
                ))}
            </div>

            {/* Modal Duyệt RMA */}
            <Dialog open={showApprove} onOpenChange={setShowApprove}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duyệt yêu cầu đổi/trả RMA</DialogTitle>
                        <DialogDescription>
                            Xác nhận phê duyệt yêu cầu và điều chỉnh số tiền hoàn lại nếu có phát sinh.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Số tiền hoàn (VNĐ)</Label>
                            <Input
                                type="number"
                                className="font-mono tabular-nums price-tag font-semibold"
                                value={approveAmount}
                                onChange={(e) => setApproveAmount(Number(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground font-mono">
                                Giá trị hiển thị: <span className="font-mono tabular-nums price-tag font-semibold text-brand">{formatCurrency(approveAmount)}</span>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Ghi chú duyệt của nhân viên (tùy chọn)</Label>
                            <Textarea
                                value={approveNote}
                                placeholder="Ghi chú điều kiện nhận máy tại Showroom..."
                                onChange={(e) => setApproveNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApprove(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={loading}
                            className="bg-brand hover:bg-brand/90 text-white"
                        >
                            {loading ? "Đang xử lý..." : "Xác nhận duyệt"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Từ chối RMA */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối yêu cầu đổi/trả</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do từ chối rõ ràng để gửi thông báo tới khách hàng.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Lý do từ chối *</Label>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="VD: Sản phẩm có dấu hiệu cấn móp, ngấm nước, quá thời hạn 30 ngày..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReject(false)}>
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
