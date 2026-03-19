"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface StatusToggleProps {
    id: string
    isActive: boolean
    onToggle: (id: string, isActive: boolean) => void
    isLoading?: boolean
    type: "about" | "contact"
    disabled?: boolean
}

export function StatusToggle({ id, isActive, onToggle, isLoading = false, type, disabled = false }: StatusToggleProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingStatus, setPendingStatus] = useState<boolean | null>(null)

    const handleToggleClick = (checked: boolean) => {
        setPendingStatus(checked)
        setShowConfirmDialog(true)
    }

    const handleConfirm = () => {
        if (pendingStatus !== null) {
            onToggle(id, pendingStatus)
        }
        setShowConfirmDialog(false)
        setPendingStatus(null)
    }

    const handleCancel = () => {
        setShowConfirmDialog(false)
        setPendingStatus(null)
    }

    const getStatusText = (active: boolean) => (active ? "Hoạt động" : "Không hoạt động")
    const getActionText = (willBeActive: boolean) => (willBeActive ? "kích hoạt" : "hủy kích hoạt")
    const getTypeText = () => (type === "about" ? "About Section" : "Contact")

    return (
        <>
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                    <Switch
                        id={`status-${id}`}
                        checked={isActive}
                        onCheckedChange={handleToggleClick}
                        disabled={disabled || isLoading}
                    />
                    <Label htmlFor={`status-${id}`} className="text-sm font-medium">
                        Trạng thái
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                        {getStatusText(isActive)}
                    </Badge>
                </div>
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn{" "}
                            <span className="font-semibold">{pendingStatus !== null ? getActionText(pendingStatus) : ""}</span>{" "}
                            {getTypeText()} này không?
                        </AlertDialogDescription>

                        {pendingStatus === false && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                                ⚠️ Khi hủy kích hoạt, nội dung sẽ không hiển thị trên trang web.
                            </div>
                        )}

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
