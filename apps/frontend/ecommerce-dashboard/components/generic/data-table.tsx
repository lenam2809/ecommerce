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
import { ChevronLeft, ChevronRight, Edit2, Eye, Trash, Inbox, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
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
    showBulkSelect?: boolean
    onBulkAction?: (selectedRows: T[]) => void
    bulkActionLabel?: string
    onEdit?: (row: T) => void
    onView?: (row: T) => void
    onDelete?: (row: T) => void
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
    showBulkSelect = false,
    onBulkAction,
    bulkActionLabel = "Thao tác trên mục đã chọn",
    onEdit,
    onView,
    onDelete,
}: DataTableProps<T>) {
    // Initialize sorting state from props but don't update it when props change
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: sortBy,
            desc: isDescending,
        },
    ])
    const [rowSelection, setRowSelection] = useState({})

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
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
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
        <Card className="rounded-xl border border-[--color-border] bg-[--color-bg-card] backdrop-blur-xl shadow-sm transition-all duration-150">
            {showBulkSelect && table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex items-center justify-between p-3 border-b border-[--color-border] bg-[--color-accent-muted] text-[--color-accent]">
                    <span className="text-sm font-medium">Đã chọn {table.getFilteredSelectedRowModel().rows.length} mục</span>
                    {onBulkAction && (
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-[--color-accent] hover:bg-indigo-600 text-white border-0"
                            onClick={() => onBulkAction(table.getFilteredSelectedRowModel().rows.map(r => r.original))}
                        >
                            {bulkActionLabel}
                        </Button>
                    )}
                </div>
            )}
            <CardContent className="p-0">
                <div className="rounded-md">
                    <Table className="w-full table-fixed">
                        <TableHeader className="sticky top-0 bg-[--color-bg-elevated] z-10 border-b border-[--color-border] shadow-xs">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b border-[--color-border] hover:bg-transparent">
                                    {showBulkSelect && (
                                        <TableHead className="w-12 text-center p-0 align-middle">
                                            <div className="flex justify-center items-center h-full">
                                                <Checkbox
                                                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                                                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                                    aria-label="Chọn tất cả"
                                                    className="border-[--color-text-3] data-[state=checked]:bg-[--color-accent] data-[state=checked]:border-[--color-accent]"
                                                />
                                            </div>
                                        </TableHead>
                                    )}
                                    {config.showRowNumbers && (
                                        <TableHead className="w-12 text-center">
                                            <span className="sr-only sm:not-sr-only">{config.rowNumberColumnTitle || "#"}</span>
                                        </TableHead>
                                    )}
                                    {headerGroup.headers.map((header) => {
                                        const isSorted = header.column.getIsSorted()
                                        return (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{ width: header.column.columnDef.size }}
                                                className="truncate overflow-hidden whitespace-nowrap text-xs font-medium uppercase tracking-widest text-[--color-text-3] py-4"
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div className="flex items-center gap-1.5">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getCanSort() && (
                                                            <div className="flex flex-col">
                                                                {isSorted === "asc" ? (
                                                                    <ChevronUp className="w-3 h-3 text-[--color-accent]" />
                                                                ) : isSorted === "desc" ? (
                                                                    <ChevronDown className="w-3 h-3 text-[--color-accent]" />
                                                                ) : (
                                                                    <ChevronsUpDown className="w-3 h-3 text-[--color-text-3] opacity-30 group-hover:opacity-100" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </TableHead>
                                        )
                                    })}
                                    {(onEdit || onView || onDelete) && (
                                        <TableHead className="w-24 text-right text-xs font-medium uppercase tracking-widest text-[--color-text-3]">
                                            Thao tác
                                        </TableHead>
                                    )}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={index} className="border-b border-[--color-border]">
                                        {showBulkSelect && (
                                            <TableCell className="w-12 text-center">
                                                <Skeleton className="h-4 w-4 mx-auto rounded bg-[--color-border]" />
                                            </TableCell>
                                        )}
                                        {config.showRowNumbers && (
                                            <TableCell className="text-center w-12">
                                                <Skeleton className="h-6 w-6 mx-auto rounded-full bg-[--color-border]" />
                                            </TableCell>
                                        )}
                                        {config.columns.map((_, colIndex) => (
                                            <TableCell key={colIndex}>
                                                <Skeleton className="h-5 w-full bg-[--color-border]/50" />
                                            </TableCell>
                                        ))}
                                        {(onEdit || onView || onDelete) && (
                                            <TableCell className="text-right">
                                                <Skeleton className="h-8 w-16 ml-auto bg-[--color-border]/50" />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={config.columns.length + (config.showRowNumbers ? 1 : 0) + (showBulkSelect ? 1 : 0) + ((onEdit || onView || onDelete) ? 1 : 0)}
                                        className="h-64 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center p-8 text-[--color-text-2]">
                                            <div className="h-16 w-16 mb-4 rounded-full bg-[--color-border]/30 flex items-center justify-center">
                                                <Inbox className="h-8 w-8 text-[--color-text-3]" />
                                            </div>
                                            <p className="text-base font-medium text-[--color-text-1] mb-1">Không tìm thấy {config.itemsName}</p>
                                            <p className="text-sm max-w-[250px] mx-auto text-[--color-text-3]">
                                                Hiện tại chưa có dữ liệu hoặc do bộ lọc. Vui lòng thử lại sau.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row, rowIndex) => (
                                    <TableRow 
                                        key={row.id} 
                                        className="group border-b border-[--color-border] hover:bg-white/[0.025] transition-colors data-[state=selected]:bg-[--color-accent-muted]/30"
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {showBulkSelect && (
                                            <TableCell className="w-12 text-center p-0 align-middle">
                                                <div className="flex justify-center items-center h-full">
                                                    <Checkbox
                                                        checked={row.getIsSelected()}
                                                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                                                        aria-label="Chọn hàng"
                                                        className="border-[--color-text-3] data-[state=checked]:bg-[--color-accent] data-[state=checked]:border-[--color-accent]"
                                                    />
                                                </div>
                                            </TableCell>
                                        )}
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
                                            <TableCell key={cell.id} className="truncate overflow-hidden whitespace-nowrap py-3 text-sm text-[--color-text-2]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                        {(onEdit || onView || onDelete) && (
                                            <TableCell className="w-24 px-4 py-2 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                    {onView && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[--color-text-2] hover:text-[--color-accent] hover:bg-[--color-accent-muted]" onClick={() => onView(row.original)}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">View</span>
                                                        </Button>
                                                    )}
                                                    {onEdit && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[--color-text-2] hover:text-[--color-accent] hover:bg-[--color-accent-muted]" onClick={() => onEdit(row.original)}>
                                                            <Edit2 className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                    )}
                                                    {onDelete && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[--color-text-2] hover:text-[--color-danger] hover:bg-[--color-danger]/10" onClick={() => onDelete(row.original)}>
                                                            <Trash className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-[--color-border] bg-[--color-bg-base]/50 rounded-b-xl">
                <div className="flex-1 text-sm text-[--color-text-2]">
                    Hiển thị <strong>{data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> đến{" "}
                    <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> trong số <strong>{totalItems}</strong>{" "}
                    {config.itemsName}
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-[--color-text-2]">Hàng / trang</p>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="h-8 w-[70px] border-[--color-border] bg-[--color-bg-elevated] text-[--color-text-1] focus:ring-[--color-accent]">
                                <SelectValue placeholder={pageSize.toString()} />
                            </SelectTrigger>
                            <SelectContent side="top" className="border-[--color-border] bg-[--color-bg-card] text-[--color-text-1]">
                                {config.pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={size.toString()} className="focus:bg-[--color-accent-muted] focus:text-[--color-accent]">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 border-[--color-border] bg-transparent text-[--color-text-2] hover:bg-[--color-bg-elevated] hover:text-[--color-text-1]"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Đi tới trang trước</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-[--color-text-2]">
                            Trang {currentPage} của {pageCount || 1}
                        </div>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 border-[--color-border] bg-transparent text-[--color-text-2] hover:bg-[--color-bg-elevated] hover:text-[--color-text-1]"
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