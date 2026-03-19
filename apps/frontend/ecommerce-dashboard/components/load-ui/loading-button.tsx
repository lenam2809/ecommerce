import type React from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/load-ui/spinner"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "@/components/ui/button"

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean
    loadingText?: string
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

export function LoadingButton({
    isLoading = false,
    loadingText,
    children,
    className,
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <Button className={cn(className)} disabled={isLoading || disabled} {...props}>
            {isLoading ? (
                <>
                    <Spinner size="sm" className="mr-2" />
                    {loadingText || children}
                </>
            ) : (
                children
            )}
        </Button>
    )
}
