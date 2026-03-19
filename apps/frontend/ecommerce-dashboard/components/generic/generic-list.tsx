"use client"

import { useState } from "react"
import { useListData } from "@/hooks/use-list-data"
import { DataTable } from "./data-table"
import { SearchBar } from "./search-bar"
import { AdvancedSearch } from "./advanced-search"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import type { ListConfig, SearchParams, DataItem } from "@/types/list-config"
import { TableOptions } from "./table-options"
import Link from "next/link"

interface GenericListProps<T extends DataItem> {
  config: ListConfig<T>
}

export function GenericList<T extends DataItem>({ config }: GenericListProps<T>) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [hideButtonAdd] = useState(config.hideButtonAdd || false)
  const [showRowNumbers, setShowRowNumbers] = useState(config.showRowNumbers || false)

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const allColumns = config.columns.map((col) => col.id as string)
    const hiddenColumns = config.defaultHiddenColumns || []
    return allColumns.filter((colId) => !hiddenColumns.includes(colId))
  })

  const [searchParams, setSearchParams] = useState<SearchParams>(() => {
    const initialParams: SearchParams = {
      pageNumber: 1,
      pageSize: config.defaultPageSize,
      sortBy: config.defaultSort.sortBy,
      isDescending: config.defaultSort.isDescending,
    }

    config.filterFields.forEach((field) => {
      initialParams[field.id] = field.defaultValue
    })

    return initialParams
  })

  const mainSearchField = config.filterFields.find((field) => !field.isAdvanced && field.type === "text")

  const { data, isLoading, isError } = useListData<T>(config, searchParams)

  const handleSearch = (searchTerm: string) => {
    if (mainSearchField) {
      setSearchParams((prev) => ({
        ...prev,
        [mainSearchField.id]: searchTerm,
        pageNumber: 1,
      }))
    }
  }

  const handleAdvancedSearch = (params: Partial<SearchParams>) => {
    setSearchParams((prev) => ({
      ...prev,
      ...params,
      pageNumber: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNumber: page,
    }))
  }

  const handleSortChange = (sortBy: string, isDescending: boolean) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy,
      isDescending,
    }))
  }

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId],
    )
  }

  const hasAdvancedSearch = config.filterFields.some((field) => field.isAdvanced)

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-auto">
      <div className="space-y-4">
        {mainSearchField && (
          <SearchBar
            searchField={mainSearchField}
            initialValue={searchParams[mainSearchField.id] || ""}
            onSearch={handleSearch}
          />
        )}

        {hasAdvancedSearch && (
          <>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="flex items-center gap-2"
            >
              {showAdvancedSearch ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ẩn tìm kiếm nâng cao
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Hiển thị tìm kiếm nâng cao
                </>
              )}
            </Button>

            {showAdvancedSearch && (
              <AdvancedSearch config={config} initialValues={searchParams} onSearch={handleAdvancedSearch} />
            )}
          </>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{config.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {!hideButtonAdd && (
            <Button asChild variant="outline" size="sm" className="ml-auto h-8 gap-1">
              <Link href={config.addUrl}>
                <Plus className="mr-2 h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Thêm mới</span>
              </Link>
            </Button>
          )}
          <TableOptions
            showRowNumbers={showRowNumbers}
            onToggleRowNumbers={setShowRowNumbers}
            columns={config.columns.map((col) => ({
              id: col.id as string,
              label: typeof col.header === "string" ? col.header : (col.meta as string),
              enableHiding: col.enableHiding,
            }))}
            visibleColumns={visibleColumns}
            onToggleColumn={handleToggleColumn}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          config={{
            ...config,
            showRowNumbers: showRowNumbers,
            columns: config.columns.filter((col) => visibleColumns.includes(col.id as string)),
          }}
          data={data?.items || []}
          totalItems={data?.totalCount || 0}
          pageCount={data?.pageCount || 0}
          currentPage={searchParams.pageNumber}
          pageSize={searchParams.pageSize}
          sortBy={searchParams.sortBy}
          isDescending={searchParams.isDescending}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onPageSizeChange={(size) =>
            setSearchParams((prev) => ({
              ...prev,
              pageSize: size,
              pageNumber: 1,
            }))
          }
        />
      </div>
    </div>
  )
}
