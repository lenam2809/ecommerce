"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[--color-ring] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[--color-bg-elevated] text-[--color-text-1] border border-[--color-border]",
        success:
          "bg-[--color-success]/10 text-[--color-success] border border-[--color-success]/20",
        warning:
          "bg-[--color-warning]/10 text-[--color-warning] border border-[--color-warning]/20",
        danger:
          "bg-[--color-danger]/10 text-[--color-danger] border border-[--color-danger]/20",
        accent:
          "bg-[--color-accent-muted] text-[--color-accent] border border-[--color-accent]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {}

export function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  return (
    <div className={statusBadgeVariants({ variant, className })} {...props} />
  )
}
