import { cn } from "@/lib/utils"
import React from "react"

interface TruncateProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    /** Giới hạn chiều rộng, mặc định là 100% */
    maxWidth?: string
    /** Hiển thị tooltip khi hover */
    title?: string
}

export function Truncate({
    children,
    maxWidth = "100%",
    title,
    className,
    ...props
}: TruncateProps) {
    return (
        <div
            className={cn(
                "truncate overflow-hidden whitespace-nowrap",
                className
            )}
            style={{ maxWidth }}
            title={title ?? (typeof children === "string" ? children : undefined)}
            {...props}
        >
            {children}
        </div>
    )
}
