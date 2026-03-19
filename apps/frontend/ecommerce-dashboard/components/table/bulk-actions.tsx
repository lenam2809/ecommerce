'use client'

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Trash2, Download, MoreHorizontal, Check, X, Archive, Tag } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface BulkAction {
    id: string
    label: string
    icon?: React.ReactNode
    variant?: "default" | "destructive"
    onClick: (selectedIds: string[]) => void | Promise<void>
    requireConfirmation?: boolean
    confirmTitle?: string
    confirmDescription?: string
}

interface BulkActionsProps {
    selectedIds: string[]
    onClearSelection: () => void
    actions: BulkAction[]
    className?: string
}

export function BulkActions({
    selectedIds,
    onClearSelection,
    actions,
    className,
}: BulkActionsProps) {
    const [pendingAction, setPendingAction] = useState<BulkAction | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    if (selectedIds.length === 0) return null

    const handleAction = async (action: BulkAction) => {
        if (action.requireConfirmation) {
            setPendingAction(action)
            return
        }

        await executeAction(action)
    }

    const executeAction = async (action: BulkAction) => {
        setIsProcessing(true)
        try {
            await action.onClick(selectedIds)
            onClearSelection()
        } finally {
            setIsProcessing(false)
            setPendingAction(null)
        }
    }

    const primaryActions = actions.slice(0, 2)
    const moreActions = actions.slice(2)

    return (
        <>
            <div className={cn(
                "flex items-center gap-2 rounded-lg bg-muted/50 border px-3 py-2",
                className
            )}>
                {/* Selection Count */}
                <div className="flex items-center gap-2 pr-2 border-r">
                    <span className="text-sm font-medium">
                        {selectedIds.length} mục đã chọn
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onClearSelection}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Bỏ chọn</span>
                    </Button>
                </div>

                {/* Primary Actions */}
                {primaryActions.map((action) => (
                    <Button
                        key={action.id}
                        variant={action.variant === "destructive" ? "destructive" : "secondary"}
                        size="sm"
                        onClick={() => handleAction(action)}
                        disabled={isProcessing}
                        className="gap-2"
                    >
                        {action.icon}
                        {action.label}
                    </Button>
                ))}

                {/* More Actions Dropdown */}
                {moreActions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="gap-2">
                                <MoreHorizontal className="h-4 w-4" />
                                Thêm
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {moreActions.map((action, index) => (
                                <div key={action.id}>
                                    {index > 0 && action.variant === "destructive" && (
                                        <DropdownMenuSeparator />
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => handleAction(action)}
                                        className={cn(
                                            "gap-2",
                                            action.variant === "destructive" && "text-destructive focus:text-destructive"
                                        )}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </DropdownMenuItem>
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.confirmTitle || "Xác nhận thao tác"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction?.confirmDescription ||
                                `Bạn có chắc muốn thực hiện thao tác này với ${selectedIds.length} mục đã chọn?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => pendingAction && executeAction(pendingAction)}
                            disabled={isProcessing}
                            className={cn(
                                pendingAction?.variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            )}
                        >
                            {isProcessing ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

// Pre-defined common bulk actions
export const createBulkDeleteAction = (
    onDelete: (ids: string[]) => void | Promise<void>
): BulkAction => ({
    id: "delete",
    label: "Xóa",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "destructive",
    onClick: onDelete,
    requireConfirmation: true,
    confirmTitle: "Xác nhận xóa",
    confirmDescription: "Bạn có chắc muốn xóa các mục đã chọn? Hành động này không thể hoàn tác.",
})

export const createBulkExportAction = (
    onExport: (ids: string[]) => void | Promise<void>
): BulkAction => ({
    id: "export",
    label: "Xuất CSV",
    icon: <Download className="h-4 w-4" />,
    onClick: onExport,
})

export const createBulkArchiveAction = (
    onArchive: (ids: string[]) => void | Promise<void>
): BulkAction => ({
    id: "archive",
    label: "Lưu trữ",
    icon: <Archive className="h-4 w-4" />,
    onClick: onArchive,
})

export const createBulkTagAction = (
    onTag: (ids: string[]) => void | Promise<void>
): BulkAction => ({
    id: "tag",
    label: "Gán nhãn",
    icon: <Tag className="h-4 w-4" />,
    onClick: onTag,
})
