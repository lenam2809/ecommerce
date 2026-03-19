'use client'

import { cn } from '@/lib/utils'
import { Check, Clock, Package, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded'

interface TimelineStep {
    status: OrderStatus
    label: string
    description?: string
    timestamp?: string
    isCompleted: boolean
    isCurrent: boolean
}

interface OrderTimelineProps {
    currentStatus: OrderStatus
    statusHistory?: Array<{
        status: OrderStatus
        timestamp: string
        note?: string
    }>
    className?: string
}

const STATUS_CONFIG: Record<OrderStatus, {
    icon: typeof Check;
    label: string;
    color: string
}> = {
    pending: {
        icon: Clock,
        label: 'Chờ xác nhận',
        color: 'text-yellow-500'
    },
    confirmed: {
        icon: Check,
        label: 'Đã xác nhận',
        color: 'text-blue-500'
    },
    processing: {
        icon: Package,
        label: 'Đang xử lý',
        color: 'text-purple-500'
    },
    shipped: {
        icon: Truck,
        label: 'Đang giao hàng',
        color: 'text-orange-500'
    },
    delivered: {
        icon: CheckCircle,
        label: 'Đã giao hàng',
        color: 'text-green-500'
    },
    cancelled: {
        icon: XCircle,
        label: 'Đã hủy',
        color: 'text-red-500'
    },
    refunded: {
        icon: RefreshCw,
        label: 'Đã hoàn tiền',
        color: 'text-gray-500'
    },
}

const STATUS_ORDER: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered'
]

function getTimelineSteps(currentStatus: OrderStatus): TimelineStep[] {
    // Handle cancelled/refunded separately
    if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
        return [{
            status: currentStatus,
            label: STATUS_CONFIG[currentStatus].label,
            isCompleted: true,
            isCurrent: true,
        }]
    }

    const currentIndex = STATUS_ORDER.indexOf(currentStatus)

    return STATUS_ORDER.map((status, index) => ({
        status,
        label: STATUS_CONFIG[status].label,
        isCompleted: index <= currentIndex,
        isCurrent: index === currentIndex,
    }))
}

export function OrderTimeline({
    currentStatus,
    statusHistory,
    className,
}: OrderTimelineProps) {
    const steps = getTimelineSteps(currentStatus)

    return (
        <div className={cn("space-y-4", className)}>
            {/* Timeline */}
            <div className="relative">
                {steps.map((step, index) => {
                    const config = STATUS_CONFIG[step.status]
                    const Icon = config.icon
                    const historyEntry = statusHistory?.find(h => h.status === step.status)

                    return (
                        <div key={step.status} className="flex items-start gap-4 pb-6 last:pb-0">
                            {/* Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "absolute left-[15px] w-0.5 h-[calc(100%-32px)] top-8",
                                        step.isCompleted ? "bg-primary" : "bg-muted"
                                    )}
                                    style={{
                                        top: `${32 + index * 56}px`,
                                        height: '40px'
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <div
                                className={cn(
                                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                                    step.isCompleted
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted bg-background text-muted-foreground",
                                    step.isCurrent && "ring-2 ring-primary ring-offset-2"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1">
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        step.isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </p>
                                {historyEntry?.timestamp && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(historyEntry.timestamp).toLocaleString('vi-VN')}
                                    </p>
                                )}
                                {historyEntry?.note && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {historyEntry.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Compact horizontal timeline for list views
interface OrderStatusBadgeProps {
    status: OrderStatus
    className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[status]
    const Icon = config.icon

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                config.color,
                "bg-current/10",
                className
            )}
        >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </div>
    )
}
