"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CopyTooltipTextProps {
    text: string
    className?: string
    tooltipPosition?: "top" | "right" | "left" | "bottom"
}

export const CopyTooltipText = ({
    text,
    className = "",
    tooltipPosition = "top",
}: CopyTooltipTextProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
            title: "Đã sao chép vào clipboard!",
        });
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleCopy}
                        className={`hover:underline hover:text-blue-600 transition-colors ${className}`}
                    >
                        {text}
                    </button>
                </TooltipTrigger>
                <TooltipContent side={tooltipPosition}>
                    <div className="flex items-center text-sm">
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-1 text-green-500" />
                                Đã sao chép!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-1" />
                                Bấm để sao chép
                            </>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
