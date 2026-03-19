"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface StatusIndicatorProps {
    isActive: boolean
    isLoading?: boolean
    showIcon?: boolean
}

export function StatusIndicator({ isActive, isLoading = false, showIcon = true }: StatusIndicatorProps) {
    if (isLoading) {
        return (
            <Badge variant="outline" className="gap-1">
                {showIcon && <Clock className="h-3 w-3 animate-pulse" />}
                Đang cập nhật...
            </Badge>
        )
    }

    return (
        <Badge variant={isActive ? "default" : "secondary"} className="gap-1">
            {showIcon && (isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />)}
            {isActive ? "Hoạt động" : "Không hoạt động"}
        </Badge>
    )
}
