import type React from "react"
import { Spinner } from "@/components/load-ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
    isLoading: boolean
    className?: string
    children?: React.ReactNode
    text?: string
}

export function LoadingOverlay({ isLoading, className, children, text = "Loading..." }: LoadingOverlayProps) {
    if (!isLoading) return <>{children}</>

    return (
        <div className={cn("relative", className)}>
            {children && <div className="opacity-50 pointer-events-none">{children}</div>}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                <Spinner size="lg" />
                {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
            </div>
        </div>
    )
}
