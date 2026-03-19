"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, List } from "lucide-react"

interface StatusFilterProps {
    currentFilter: "all" | "active" | "inactive"
    onFilterChange: (filter: "all" | "active" | "inactive") => void
    counts: {
        all: number
        active: number
        inactive: number
    }
}

export function StatusFilter({ currentFilter, onFilterChange, counts }: StatusFilterProps) {
    const filters = [
        {
            key: "all" as const,
            label: "Tất cả",
            icon: List,
            count: counts.all,
        },
        {
            key: "active" as const,
            label: "Hoạt động",
            icon: CheckCircle,
            count: counts.active,
        },
        {
            key: "inactive" as const,
            label: "Không hoạt động",
            icon: XCircle,
            count: counts.inactive,
        },
    ]

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Lọc theo trạng thái:</span>
            {filters.map((filter) => {
                const Icon = filter.icon
                const isActive = currentFilter === filter.key

                return (
                    <Button
                        key={filter.key}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => onFilterChange(filter.key)}
                        className="gap-2"
                    >
                        <Icon className="h-4 w-4" />
                        {filter.label}
                        <Badge variant={isActive ? "secondary" : "outline"} className="ml-1">
                            {filter.count}
                        </Badge>
                    </Button>
                )
            })}
        </div>
    )
}
