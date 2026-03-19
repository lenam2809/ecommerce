"use client"

// Import necessary components
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Check } from "lucide-react"

interface RowNumberCellProps {
    number: number
    isLoading: boolean
    className?: string
}

// Update the RowNumberCell component
export function RowNumberCell({ number, isLoading, className }: RowNumberCellProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(number.toString())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const cn = (...inputs: (string | undefined | null | boolean)[]): string => {
        return inputs.filter(Boolean).join(" ")
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={copyToClipboard}
                        className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium cursor-pointer hover:bg-muted-foreground/20 transition-colors",
                            isLoading ? "bg-muted" : "bg-muted-foreground/10 text-muted-foreground",
                            className,
                        )}
                    >
                        {isLoading ? "" : number}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    {copied ? (
                        <div className="flex items-center">
                            <Check className="h-3 w-3 mr-1" /> Đã sao chép!
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Copy className="h-3 w-3 mr-1" /> Bấm để sao chép
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
