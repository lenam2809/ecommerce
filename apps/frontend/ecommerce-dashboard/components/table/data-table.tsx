"use client"

import * as React from "react"
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
    ColumnDef,
    ColumnFiltersState,

    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { TableViewSelector } from "./table-view-selector"
import { TableToolbar } from "./table-toolbar"
import { TablePagination } from "./table-pagination"
import { DraggableRow } from "./draggable-row"
import { DragHandle } from "./drag-handle"
import { Checkbox } from "@/components/ui/checkbox"

interface DataTableProps<TData> {
    data: TData[]
    columns: ColumnDef<TData>[]
    enableRowSelection?: boolean
    enableSorting?: boolean
    enableDragAndDrop?: boolean
    views?: {
        id: string
        label: string
        badgeCount?: number
    }[]
    defaultView?: string
    showViewSelector?: boolean // ✅ mới
    showToolbar?: boolean // ✅ mới
}


export function DataTable<TData>({
    data: initialData,
    columns,
    enableRowSelection = true,
    enableSorting = true,
    enableDragAndDrop = false,
    views = [
        { id: "default", label: "Default" }
    ],
    defaultView = "default",
    showViewSelector = true,
    showToolbar = true,
}: DataTableProps<TData>) {
    const [data, setData] = React.useState(() => initialData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map((item: any) => item.id) || [], // eslint-disable-line @typescript-eslint/no-explicit-any
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row: any) => row.id.toString(), // eslint-disable-line @typescript-eslint/no-explicit-any
        enableRowSelection,
        enableSorting: enableSorting,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    function handleDragEnd(event: DragEndEvent) {
        if (!enableDragAndDrop) return

        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    // Thêm cột drag handle nếu enableDragAndDrop là true
    const finalColumns = React.useMemo(() => {
        if (enableDragAndDrop) {
            return [
                {
                    id: "drag",
                    header: () => null,
                    cell: ({ row }) => <DragHandle id={(row.original as any).id} />, // eslint-disable-line @typescript-eslint/no-explicit-any
                },
                ...columns
            ]
        }
        return columns
    }, [columns, enableDragAndDrop])

    // Thêm cột selection nếu enableRowSelection là true
    const columnsWithSelection = React.useMemo(() => {
        const updatedColumns = finalColumns.map(col => ({
            ...col,
            enableSorting: col.enableSorting ?? enableSorting
        }))

        if (enableRowSelection) {
            return [
                {
                    id: "select",
                    header: ({ table }) => (
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={
                                    table.getIsAllPageRowsSelected() ||
                                    (table.getIsSomePageRowsSelected() && "indeterminate")
                                }
                                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                aria-label="Chọn tất cả"
                            />
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(value) => row.toggleSelected(!!value)}
                                aria-label="Chọn hàng"
                            />
                        </div>
                    ),
                    enableSorting: false,
                    enableHiding: false,
                },
                ...updatedColumns
            ]
        }

        return updatedColumns
    }, [finalColumns, enableRowSelection, enableSorting])


    return (
        <Tabs
            defaultValue={defaultView}
            className="w-full flex-col justify-start gap-6"
        >
            {((showViewSelector ?? true) || (showToolbar ?? true)) && (
                <div className="flex items-center justify-between px-4 lg:px-6">
                    {(showViewSelector ?? true) ? (
                        <TableViewSelector views={views} defaultView={defaultView} />
                    ) : <div />}

                    {(showToolbar ?? true) && (
                        <TableToolbar table={table} />
                    )}
                </div>
            )}


            {views.map((view) => (
                <TabsContent
                    key={view.id}
                    value={view.id}
                    className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
                >
                    <div className="overflow-hidden rounded-lg border">
                        <DndContext
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={handleDragEnd}
                            sensors={enableDragAndDrop ? sensors : undefined}
                            id={sortableId}
                        >
                            <Table>
                                <TableHeader className="bg-muted sticky top-0 z-10">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id} colSpan={header.colSpan}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                    {table.getRowModel().rows?.length ? (
                                        <SortableContext
                                            items={dataIds}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {table.getRowModel().rows.map((row) => (
                                                enableDragAndDrop ? (
                                                    <DraggableRow key={row.id} row={row} />
                                                ) : (
                                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                )
                                            ))}
                                        </SortableContext>
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columnsWithSelection.length}
                                                className="h-24 text-center"
                                            >
                                                Không có dữ liệu
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DndContext>
                    </div>
                    <TablePagination table={table} />
                </TabsContent>
            ))}
        </Tabs>
    )
}