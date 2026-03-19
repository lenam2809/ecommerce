import { OptionType } from "@/components/ui/select/single-select"
import type { ColumnDef } from "@tanstack/react-table"

// Generic type for any data item
export interface DataItem {
    id: string
    [key: string]: any
}

// Filter field types
export type FilterFieldType = "text" | "number" | "select" | "multiselect" | "checkbox" | "range" | "date" | "daterange"

// Filter field definition
export interface FilterField {
    id: string
    label: string
    type: FilterFieldType
    placeholder?: string
    options?: OptionType<any>[]
    // New API options configuration
    optionsEndpoint?: string // The API endpoint to fetch options from
    optionsValueField?: string // The field to use as the value (default: "id")
    optionsLabelField?: string // The field to use as the label (default: "name")
    min?: number
    max?: number
    step?: number
    defaultValue?: any
    apiParam?: string // The parameter name to use in API calls
    isAdvanced?: boolean // Whether this field appears in advanced search
    valueType?: string // The type of value to be used in the filter (e.g., "string", "number", "boolean")
}

// Sort option definition
export interface SortOption {
    id: string
    label: string
    apiParam?: string // The parameter name to use in API calls
}

// List configuration
export interface ListConfig<T extends DataItem = DataItem> {
    id: string
    title: string
    hideButtonAdd?: boolean // URL for adding a new item
    addUrl: string // URL for adding a new item
    endpoint: string
    itemsName: string // Plural name of the items (e.g., "products", "categories")
    itemName: string // Singular name of the items (e.g., "product", "category")
    columns: ColumnDef<T>[]
    filterFields: FilterField[]
    sortOptions: SortOption[]
    defaultSort: {
        sortBy: string
        isDescending: boolean
    }
    defaultPageSize: number
    pageSizeOptions: number[]
    relatedEndpoints?: {
        [key: string]: string // For related data like categories, brands, etc.
    }
    showRowNumbers?: boolean
    rowNumberColumnTitle?: string
    //default hidden columns initially
    defaultHiddenColumns?: string[] // Columns that should be hidden by default
}

// Search parameters for any list
export interface SearchParams {
    pageNumber: number
    pageSize: number
    sortBy: string
    isDescending: boolean
    [key: string]: any // Dynamic parameters based on filter fields
}

// API response structure
export interface ListResponse<T extends DataItem = DataItem> {
    items: T[]
    totalCount: number
    pageCount: number
    currentPage: number
}