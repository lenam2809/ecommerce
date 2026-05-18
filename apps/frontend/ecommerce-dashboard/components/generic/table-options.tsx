"use client"

import { logger } from '@/lib/logger'
import { Button } from "@/components/ui/button"
import { Settings, Eye, EyeOff } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface TableOptionsProps {
    showRowNumbers: boolean
    onToggleRowNumbers: (show: boolean) => void
    columns: { id: string; label: string; enableHiding?: boolean }[]
    visibleColumns: string[]
    onToggleColumn: (columnId: string) => void
}

export function TableOptions({ showRowNumbers, onToggleRowNumbers, columns, visibleColumns, onToggleColumn }: TableOptionsProps) {

    const selectableColumns = columns.filter((column) => column.enableHiding !== false && column.label !== undefined && column.label !== null);
    logger.debug('columns', columns);
    logger.debug('selectableColumns', selectableColumns);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
                    <Settings className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Tùy chọn bảng</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tùy chọn hiển thị bảng</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={showRowNumbers} onCheckedChange={onToggleRowNumbers}>
                    {showRowNumbers ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                    <span>Hiển thị số hàng</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Cột hiển thị</DropdownMenuLabel>
                {selectableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={visibleColumns.includes(column.id)}
                        onCheckedChange={() => onToggleColumn(column.id)}
                        disabled={column.id === "actions"} // Không cho phép ẩn cột actions
                    >
                        {column.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
