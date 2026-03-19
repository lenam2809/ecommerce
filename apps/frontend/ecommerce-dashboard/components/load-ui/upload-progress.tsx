'use client'

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { X, FileIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type UploadStatus = "idle" | "uploading" | "success" | "error"

interface UploadProgressProps {
    fileName: string
    fileSize?: number
    progress: number
    status: UploadStatus
    errorMessage?: string
    onCancel?: () => void
    onRetry?: () => void
    className?: string
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function UploadProgress({
    fileName,
    fileSize,
    progress,
    status,
    errorMessage,
    onCancel,
    onRetry,
    className,
}: UploadProgressProps) {
    return (
        <div className={cn(
            "flex items-start gap-3 p-3 rounded-lg border bg-card",
            status === "error" && "border-destructive/50 bg-destructive/5",
            status === "success" && "border-green-500/50 bg-green-500/5",
            className
        )}>
            {/* File Icon */}
            <div className={cn(
                "flex-shrink-0 rounded-md p-2",
                status === "error" ? "bg-destructive/10" : "bg-muted"
            )}>
                <FileIcon className={cn(
                    "h-5 w-5",
                    status === "error" ? "text-destructive" : "text-muted-foreground"
                )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
                {/* File Name */}
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                        {fileName}
                    </p>

                    {/* Status Icon */}
                    {status === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                    )}
                    {status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    {status === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                </div>

                {/* File Size & Progress */}
                {status === "uploading" && (
                    <>
                        <Progress value={progress} className="h-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{progress}%</span>
                            {fileSize && <span>{formatFileSize(fileSize)}</span>}
                        </div>
                    </>
                )}

                {/* Success Message */}
                {status === "success" && (
                    <p className="text-xs text-green-600">Tải lên thành công</p>
                )}

                {/* Error Message */}
                {status === "error" && (
                    <p className="text-xs text-destructive">{errorMessage || "Có lỗi xảy ra khi tải lên"}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
                {status === "uploading" && onCancel && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onCancel}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Hủy</span>
                    </Button>
                )}
                {status === "error" && onRetry && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRetry}
                    >
                        Thử lại
                    </Button>
                )}
            </div>
        </div>
    )
}

interface MultiUploadProgressProps {
    files: Array<{
        id: string
        fileName: string
        fileSize?: number
        progress: number
        status: UploadStatus
        errorMessage?: string
    }>
    onCancel?: (id: string) => void
    onRetry?: (id: string) => void
    className?: string
}

export function MultiUploadProgress({
    files,
    onCancel,
    onRetry,
    className,
}: MultiUploadProgressProps) {
    if (files.length === 0) return null

    return (
        <div className={cn("space-y-2", className)}>
            {files.map((file) => (
                <UploadProgress
                    key={file.id}
                    fileName={file.fileName}
                    fileSize={file.fileSize}
                    progress={file.progress}
                    status={file.status}
                    errorMessage={file.errorMessage}
                    onCancel={onCancel ? () => onCancel(file.id) : undefined}
                    onRetry={onRetry ? () => onRetry(file.id) : undefined}
                />
            ))}
        </div>
    )
}
