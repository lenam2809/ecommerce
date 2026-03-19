"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronDown, Power, PowerOff } from "lucide-react"

interface BulkStatusActionsProps {
    selectedIds: string[]
    onBulkStatusUpdate: (ids: string[], isActive: boolean) => void
    isLoading?: boolean
    type: "about" | "contact"
}

export function BulkStatusActions({
    selectedIds,
    onBulkStatusUpdate,
    isLoading = false,
    type,
}: BulkStatusActionsProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingAction, setPendingAction] = useState<{ action: "activate" | "deactivate"; ids: string[] } | null>(null)

    const handleBulkAction = (action: "activate" | "deactivate") => {
        setPendingAction({ action, ids: selectedIds })
        setShowConfirmDialog(true)
    }

    const handleConfirm = () => {
        if (pendingAction) {
            onBulkStatusUpdate(pendingAction.ids, pendingAction.action === "activate")
        }
        setShowConfirmDialog(false)
        setPendingAction(null)
    }

    const handleCancel = () => {
        setShowConfirmDialog(false)
        setPendingAction(null)
    }

    const getTypeText = () => (type === "about" ? "About Section" : "Contact")

    if (selectedIds.length === 0) {
        return null
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isLoading} className="gap-2 bg-transparent">
                        Hành động hàng loạt ({selectedIds.length})
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction("activate")} className="gap-2">
                        <Power className="h-4 w-4" />
                        Kích hoạt tất cả
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("deactivate")} className="gap-2">
                        <PowerOff className="h-4 w-4" />
                        Hủy kích hoạt tất cả
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hành động hàng loạt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn{" "}
                            <span className="font-semibold">
                                {pendingAction?.action === "activate" ? "kích hoạt" : "hủy kích hoạt"}
                            </span>{" "}
                            {selectedIds.length} {getTypeText()} đã chọn không?
                            {pendingAction?.action === "deactivate" && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                                    ⚠️ Các mục bị hủy kích hoạt sẽ không hiển thị trên trang web.
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>Xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
