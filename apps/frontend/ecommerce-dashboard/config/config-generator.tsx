"use client"

import type React from "react"

import type { ListConfig, FilterField, SortOption, DataItem } from "@/types/list-config"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfigGeneratorOptions<T extends DataItem> {
    id: string
    title: string
    endpoint: string
    itemsName: string
    itemName: string
    fields: {
        id: keyof T & string
        label: string
        sortable?: boolean
        filterable?: boolean
        filterType?: FilterField["type"]
        isAdvanced?: boolean
        options?: { value: string; label: string }[] // Changed from id to value
        min?: number
        max?: number
        step?: number
        render?: (value: unknown) => React.ReactNode,
        enableHiding?: boolean; // Thêm enableHiding để kiểm soát ẩn/hiện cột
    }[]
    defaultSort?: {
        field: keyof T & string
        isDescending: boolean
    }
    defaultPageSize?: number
    pageSizeOptions?: number[]
    relatedEndpoints?: Record<string, string>
    showRowNumbers?: boolean
    rowNumberColumnTitle?: string
    addUrl?: string // Added addUrl as optional
}

export function generateListConfig<T extends DataItem>({
    id,
    title,
    endpoint,
    itemsName,
    itemName,
    fields,
    defaultSort,
    defaultPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
    relatedEndpoints,
    showRowNumbers,
    rowNumberColumnTitle,
    addUrl, // Added addUrl
}: ConfigGeneratorOptions<T>): ListConfig<T> {
    // Generate columns
    const columns: ColumnDef<T>[] = fields.map((field) => ({
        accessorKey: field.id,
        header: field.sortable
            ? ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const isCurrentlyDescending = column.getIsSorted() === "desc"
                        column.toggleSorting(!isCurrentlyDescending)
                    }
                    }
                >
                    {field.label}
                    < ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
            : field.label,
        cell: field.render
            ? ({ row }) => field.render!(row.getValue(field.id))
            : ({ row }) => <div>{row.getValue(field.id)} </div>,
        size: field.id === "actions" ? 120 : 150, // Cột actions hẹp hơn, các cột khác 150px
        minSize: field.id === "actions" ? 100 : 120, // Chiều rộng tối thiểu
        enableHiding: field.enableHiding ?? true, // Mặc định cho phép ẩn, trừ khi chỉ định
    }))

    // Generate filter fields
    const filterFields: FilterField[] = fields
        .filter((field) => field.filterable)
        .map((field) => ({
            id: field.id,
            label: field.label,
            type: field.filterType || "text",
            placeholder: `Tìm kiếm theo ${field.label.toLowerCase()}...`,
            options: field.options,
            min: field.min,
            max: field.max,
            step: field.step,
            defaultValue: field.filterType === "range" ? [field.min || 0, field.max || 100] : "",
            isAdvanced: field.isAdvanced,
        }));

    // Generate sort options
    const sortOptions: SortOption[] = fields
        .filter((field) => field.sortable)
        .map((field) => ({
            id: field.id,
            label: field.label,
            apiParam: "sortBy",
        }));

    return {
        id,
        title,
        endpoint,
        itemsName,
        itemName,
        columns,
        filterFields,
        sortOptions,
        defaultSort: {
            sortBy: defaultSort?.field || fields[0].id,
            isDescending: defaultSort?.isDescending || false,
        },
        defaultPageSize,
        pageSizeOptions,
        relatedEndpoints,
        showRowNumbers,
        rowNumberColumnTitle,
        addUrl: addUrl || "", // Added addUrl
    }
}
