"use client"

import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X, Loader2 } from "lucide-react"
import { cva } from "class-variance-authority"
import * as React from "react"

export type ToastType = "success" | "error" | "warning" | "info" | "loading" | "default"

export interface AppToastProps {
    title?: string
    description?: string
    type?: ToastType
    duration?: number
    showCloseButton?: boolean
    className?: string
    action?: {
        label: string
        onClick: () => void
    }
    id?: string | number
}

// Tech-Luxe Icon Variants
const iconVariants = cva("relative z-10", {
    variants: {
        type: {
            default: "text-foreground",
            success: "text-emerald-500",
            error: "text-rose-500",
            warning: "text-amber-500",
            info: "text-blue-500",
            loading: "text-blue-400 animate-spin"
        },
    },
    defaultVariants: {
        type: "default",
    },
})

// Tech-Luxe Background Gradients
const gradientVariants = cva("absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-500", {
    variants: {
        type: {
            default: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_70%)]",
            success: "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.25),transparent_70%)]",
            error: "bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.25),transparent_70%)]",
            warning: "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.25),transparent_70%)]",
            info: "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_70%)]",
            loading: "bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.25),transparent_70%)]",
        },
    },
    defaultVariants: {
        type: "default",
    },
})

// Progress Bar Color Variants
const progressBarVariants = cva("h-full w-full absolute top-0 left-0", {
    variants: {
        type: {
            default: "bg-white/40",
            success: "bg-emerald-500",
            error: "bg-rose-500",
            warning: "bg-amber-500",
            info: "bg-blue-500",
            loading: "bg-blue-400",
        },
    },
    defaultVariants: {
        type: "default",
    },
})

const ToastCard = ({
    title,
    description,
    type = "default",
    duration = 4000,
    showCloseButton = true,
    className,
    action,
    id,
    onDismiss
}: AppToastProps & { onDismiss: () => void }) => {
    // Determine icon
    const Icon = {
        success: CheckCircle2,
        error: AlertOctagon,
        warning: AlertTriangle,
        info: Info,
        loading: Loader2,
        default: Info
    }[type]

    return (
        <div
            className={cn(
                "group relative w-full overflow-hidden rounded-xl p-4 shadow-xl transition-all duration-300",
                "bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5", // Glassmorphism
                "hover:-translate-y-1 hover:shadow-2xl hover:bg-background/70", // Lift effect & hover state
                "flex items-start gap-4 min-w-[340px]",
                className
            )}
        >
            {/* Background Gradient Mesh */}
            <div className={gradientVariants({ type })} />

            {/* Noise Texture (Optional - for extra premium feel, CSS dependent, keeping it simple for now) */}

            {/* Content Container */}
            <div className="flex-shrink-0 pt-0.5">
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full ring-1 shadow-inner backdrop-blur-sm",
                    type === "success" && "bg-emerald-500/10 ring-emerald-500/20",
                    type === "error" && "bg-rose-500/10 ring-rose-500/20",
                    type === "warning" && "bg-amber-500/10 ring-amber-500/20",
                    type === "info" && "bg-blue-500/10 ring-blue-500/20",
                    type === "loading" && "bg-blue-500/10 ring-blue-500/20",
                    type === "default" && "bg-primary/10 ring-primary/20",
                )}>
                    <Icon className={cn("h-4 w-4", iconVariants({ type }))} />
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 z-10">
                {title && (
                    <h4 className="text-[14px] font-semibold tracking-tight text-foreground/90">
                        {title}
                    </h4>
                )}
                {description && (
                    <p className="text-[13px] leading-snug text-muted-foreground font-light tracking-wide">
                        {description}
                    </p>
                )}

                {action && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            action.onClick()
                            toast.dismiss(id)
                        }}
                        className={cn(
                            "mt-2 self-start px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200",
                            "border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/30",
                            "active:scale-95"
                        )}
                    >
                        {action.label}
                    </button>
                )}
            </div>

            {showCloseButton && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDismiss()
                    }}
                    className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors z-20"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}

            {/* Progress Bar */}
            {type !== "loading" && duration !== Infinity && type !== "error" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/20 w-full overflow-hidden">
                    <div
                        className={cn(
                            progressBarVariants({ type }),
                            "origin-left animate-progress-linear" // Custom animation class needed
                        )}
                        style={{
                            animationDuration: `${duration}ms`,
                            animationPlayState: "running",
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export const AppToaster = {
    show: (props: AppToastProps) => {
        const { id, duration = 4000, ...rest } = props
        return toast.custom((t) => (
            <ToastCard
                {...rest}
                id={t}
                duration={duration}
                onDismiss={() => toast.dismiss(t)}
            />
        ), {
            id,
            duration: props.type === "error" ? Infinity : duration, // Critical errors don't auto-dismiss by default or have long duration
        })
    },
    success: (title: string, props?: Omit<AppToastProps, "type" | "title">) =>
        AppToaster.show({ title, type: "success", ...props }),

    error: (title: string, props?: Omit<AppToastProps, "type" | "title">) =>
        AppToaster.show({ title, type: "error", ...props }),

    warning: (title: string, props?: Omit<AppToastProps, "type" | "title">) =>
        AppToaster.show({ title, type: "warning", ...props }),

    info: (title: string, props?: Omit<AppToastProps, "type" | "title">) =>
        AppToaster.show({ title, type: "info", ...props }),

    loading: (title: string, props?: Omit<AppToastProps, "type" | "title">) =>
        AppToaster.show({ title, type: "loading", duration: Infinity, ...props }),

    promise: <T,>(
        promise: Promise<T>,
        {
            loading,
            success,
            error,
        }: {
            loading: string | AppToastProps
            success: string | ((data: T) => AppToastProps)
            error: string | ((error: unknown) => AppToastProps)
        },
    ) => {
        const id = toast.loading(
            typeof loading === "string" ? loading : loading.title || "Loading...",
            {
                // We want to render our custom component even for loading state if possible, 
                // but sonner's toast.promise doesn't easily convert the loading state to a custom component 
                // unless we manage the promise manually or use the standard UI for loading and then custom for success/error.
                // For consistency, let's try to map it.
            }
        )

        // However, sonner's toast.promise holds the ID.
        // A better approach for full consistency is to use AppToaster.loading -> then update. 
        // But to keep API simple and compatible:

        promise
            .then((data) => {
                const successProps = typeof success === "function" ? success(data) : { title: success }
                const finalProps = typeof successProps === "string" ? { title: successProps } : successProps

                toast.dismiss(id)
                AppToaster.success(finalProps.title || "Success", { ...finalProps, id })
            })
            .catch((err) => {
                const errorProps = typeof error === "function" ? error(err) : { title: error }
                const finalProps = typeof errorProps === "string" ? { title: errorProps } : errorProps

                toast.dismiss(id)
                AppToaster.error(finalProps.title || "Error", { ...finalProps, id })
            })

        return id;
    },

    dismiss: (id?: string | number) => toast.dismiss(id),
    dismissAll: () => toast.dismiss(),
}
