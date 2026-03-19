"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ToastProviderProps {
    /**
     * The position of the toast on the screen
     * @default "bottom-right"
     */
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
    /**
     * The offset from the edge of the screen
     * @default 32
     */
    offset?: number | string
    /**
     * The gap between toasts
     * @default 14
     */
    gap?: number
    /**
     * The duration of the toast in milliseconds
     * @default 4000
     */
    duration?: number
    /**
     * Whether to visually expand the toast on hover
     * @default true
     */
    expand?: boolean
    /**
     * The maximum number of toasts to show at once
     * @default 3
     */
    visibleToasts?: number
    /**
     * Whether to close the toast when clicking on it
     * @default false
     */
    closeButton?: boolean
    /**
     * Custom class names for the toast container
     */
    className?: string
    /**
     * Whether to use rich colors for the toast
     * @default false
     */
    richColors?: boolean
}

export function ToastProvider({
    position = "bottom-right",
    offset = 32,
    gap = 14,
    duration = 4000,
    expand = true,
    visibleToasts = 3,
    closeButton = false,
    className,
    richColors = false,
}: ToastProviderProps) {
    const { theme } = useTheme()

    return (
        <SonnerToaster
            position={position}
            offset={offset}
            gap={gap}
            expand={expand}
            duration={duration}
            visibleToasts={visibleToasts}
            closeButton={closeButton}
            theme={theme as "light" | "dark" | "system"}
            className={cn("group toast-group", className)}
            richColors={richColors}
        />
    )
}
