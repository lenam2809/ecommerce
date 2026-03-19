"use client"

import { useState, useCallback } from "react"
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ListConfig, DataItem } from "@/types/list-config"
// Import the RowNumberCell component
import { RowNumberCell } from "./row-number-cell"


interface DataTableProps<T extends DataItem> {
    config: ListConfig<T>
    data: T[]
    totalItems: number
    pageCount: number
    currentPage: number
    pageSize: number
    sortBy: string
    isDescending: boolean
    isLoading: boolean
    isError: boolean
    onPageChange: (page: number) => void
    onSortChange: (column: string, isDescending: boolean) => void
    onPageSizeChange: (pageSize: number) => void
}

export function DataTable<T extends DataItem>({
    config,
    data,
    totalItems,
    pageCount,
    currentPage,
    pageSize,
    sortBy,
    isDescending,
    isLoading,
    isError,
    onPageChange,
    onSortChange,
    onPageSizeChange,
}: DataTableProps<T>) {
    // Initialize sorting state from props but don't update it when props change
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: sortBy,
            desc: isDescending,
        },
    ])

    // Remove the effect that updates sorting when props change
    // This breaks the infinite loop

    const table = useReactTable({
        data,
        columns: config.columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: (updater) => {
            // Handle sorting change in a single place
            const newSorting = typeof updater === 'function'
                ? updater(sorting)
                : updater;

            setSorting(newSorting);

            // Only call the parent handler if there's actually a sort column
            if (newSorting.length > 0) {
                const { id, desc } = newSorting[0];
                onSortChange(id, desc);
            }
        },
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        manualPagination: true,
        pageCount,
    })

    // Remove the second effect that calls onSortChange when sorting changes
    // This was the other part of the infinite loop

    const handlePageSizeChange = useCallback((value: string) => {
        onPageSizeChange(Number(value));
    }, [onPageSizeChange]);

    if (isError) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-10">
                        <p className="text-red-500">Lỗi khi tải {config.itemsName}. Vui lòng thử lại sau.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {config.showRowNumbers && (
                                        <TableHead className="w-12 text-center">
                                            <span className="sr-only sm:not-sr-only">{config.rowNumberColumnTitle || "#"}</span>
                                        </TableHead>
                                    )}
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ width: header.column.columnDef.size }}
                                            className="truncate overflow-hidden whitespace-nowrap"
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={index}>
                                        {config.showRowNumbers && (
                                            <TableCell className="text-center">
                                                <Skeleton className="h-6 w-6 mx-auto" />
                                            </TableCell>
                                        )}
                                        {config.columns.map((_, colIndex) => (
                                            <TableCell key={colIndex}>
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={config.showRowNumbers ? config.columns.length + 1 : config.columns.length}
                                        className="h-24 text-center"
                                    >
                                        Không tìm thấy {config.itemsName}.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row, rowIndex) => (
                                    <TableRow key={row.id}>
                                        {config.showRowNumbers && (
                                            <TableCell className="text-center w-12">
                                                {isLoading ? (
                                                    <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                                                ) : (
                                                    <RowNumberCell
                                                        number={(currentPage - 1) * pageSize + rowIndex + 1}
                                                        className="mx-auto hidden sm:flex"
                                                        isLoading={isLoading} />
                                                )}
                                            </TableCell>
                                        )}
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="truncate overflow-hidden whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Hiển thị <strong>{data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> đến{" "}
                    <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> trong số <strong>{totalItems}</strong>{" "}
                    {config.itemsName}
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Hàng trên mỗi trang</p>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize.toString()} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {config.pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Đi tới trang trước</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Trang {currentPage} của {pageCount || 1}
                        </div>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pageCount || pageCount === 0}
                        >
                            <span className="sr-only">Chuyển đến trang tiếp theo</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}