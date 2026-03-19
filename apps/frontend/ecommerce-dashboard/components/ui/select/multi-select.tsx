"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Virtuoso } from "react-virtuoso"

export type OptionType<T = string> = {
    value: T
    label: string
    disabled?: boolean
    description?: string
    icon?: React.ReactNode
}

export type OptionGroupType<T = string> = {
    label: string
    options: OptionType<T>[]
}

export interface MultiSelectProps<T = string> {
    // Core props
    options: OptionType<T>[] | OptionGroupType<T>[]
    values?: T[]
    defaultValues?: T[]
    onChange?: (values: T[]) => void
    onSearch?: (query: string) => void

    // UI props
    placeholder?: string
    searchPlaceholder?: string
    emptySearchMessage?: string
    maxDisplayedTags?: number

    // State props
    disabled?: boolean
    isLoading?: boolean
    loadingMessage?: string

    // Styling props
    className?: string
    triggerClassName?: string
    contentClassName?: string
    tagClassName?: string

    // Customization props
    renderOption?: (option: OptionType<T>, isSelected: boolean) => React.ReactNode
    renderTag?: (option: OptionType<T>, onRemove: () => void) => React.ReactNode
    renderValue?: (selectedOptions: OptionType<T>[]) => React.ReactNode

    // Behavior props
    searchable?: boolean
    clearable?: boolean
    closeOnSelect?: boolean
    virtualScrolling?: boolean
    virtualScrollingThreshold?: number

    // Search props
    searchDebounceMs?: number
    minSearchLength?: number

    // Accessibility props
    "aria-label"?: string
    "aria-describedby"?: string
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function MultiSelect<T = string>({
    options,
    values: controlledValues,
    defaultValues = [],
    onChange,
    onSearch,
    placeholder = "Chọn nhiều tùy chọn...",
    searchPlaceholder = "Tìm kiếm...",
    emptySearchMessage = "Không có kết quả.",
    maxDisplayedTags = 3,
    disabled = false,
    isLoading = false,
    loadingMessage = "Đang tải...",
    className,
    triggerClassName,
    contentClassName,
    tagClassName,
    renderOption,
    renderTag,
    renderValue,
    searchable = true,
    clearable = true,
    closeOnSelect = false,
    virtualScrolling = false,
    virtualScrollingThreshold = 100,
    searchDebounceMs = 300,
    minSearchLength = 0,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
}: MultiSelectProps<T>) {
    // State management
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const [internalValues, setInternalValues] = React.useState<T[]>(defaultValues)
    const [focusedIndex, setFocusedIndex] = React.useState(-1)

    // Determine if component is controlled
    const isControlled = controlledValues !== undefined
    const values = isControlled ? controlledValues : internalValues

    // Debounced search
    const debouncedSearch = useDebounce(search, searchDebounceMs)

    // Determine if options are grouped
    const hasGroups = React.useMemo(() => {
        return options.length > 0 && "options" in options[0]
    }, [options])

    // Get flat list of all options
    const allOptions = React.useMemo(() => {
        if (!hasGroups) {
            return options as OptionType<T>[]
        }
        return (options as OptionGroupType<T>[]).flatMap((group) => group.options)
    }, [options, hasGroups])

    // Get selected options
    const selectedOptions = React.useMemo(() => {
        return allOptions.filter((option) => values.includes(option.value))
    }, [allOptions, values])

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
        if (!debouncedSearch || debouncedSearch.length < minSearchLength) {
            return options
        }

        const lowerSearch = debouncedSearch.toLowerCase()

        if (hasGroups) {
            return (options as OptionGroupType<T>[])
                .map((group) => ({
                    ...group,
                    options: group.options.filter(
                        (option) =>
                            option.label.toLowerCase().includes(lowerSearch) ||
                            option.description?.toLowerCase().includes(lowerSearch),
                    ),
                }))
                .filter((group) => group.options.length > 0)
        }

        return (options as OptionType<T>[]).filter(
            (option) =>
                option.label.toLowerCase().includes(lowerSearch) || option.description?.toLowerCase().includes(lowerSearch),
        )
    }, [debouncedSearch, options, hasGroups, minSearchLength])

    // Get flat filtered options for keyboard navigation
    const flatFilteredOptions = React.useMemo(() => {
        if (!hasGroups) {
            return filteredOptions as OptionType<T>[]
        }
        return (filteredOptions as OptionGroupType<T>[]).flatMap((group) => group.options)
    }, [filteredOptions, hasGroups])

    // Handle value change
    const handleValueChange = React.useCallback(
        (newValues: T[]) => {
            if (!isControlled) {
                setInternalValues(newValues)
            }
            onChange?.(newValues)
        },
        [isControlled, onChange],
    )

    // Handle option select
    const handleSelect = React.useCallback(
        (value: T) => {
            const newValues = values.includes(value) ? values.filter((v) => v !== value) : [...values, value]

            handleValueChange(newValues)

            if (closeOnSelect) {
                setOpen(false)
            }
        },
        [values, handleValueChange, closeOnSelect],
    )

    // Handle tag remove
    const handleRemoveTag = React.useCallback(
        (valueToRemove: T) => {
            const newValues = values.filter((v) => v !== valueToRemove)
            handleValueChange(newValues)
        },
        [values, handleValueChange],
    )

    // Handle clear all
    const handleClearAll = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            handleValueChange([])
        },
        [handleValueChange],
    )

    // Handle search change
    const handleSearchChange = React.useCallback(
        (value: string) => {
            setSearch(value)
            setFocusedIndex(-1)
            onSearch?.(value)
        },
        [onSearch],
    )

    // Keyboard navigation
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (!open) return

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setFocusedIndex((prev) => (prev < flatFilteredOptions.length - 1 ? prev + 1 : 0))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setFocusedIndex((prev) => (prev > 0 ? prev - 1 : flatFilteredOptions.length - 1))
                    break
                case "Enter":
                    e.preventDefault()
                    if (focusedIndex >= 0 && focusedIndex < flatFilteredOptions.length) {
                        const option = flatFilteredOptions[focusedIndex]
                        if (!option.disabled) {
                            handleSelect(option.value)
                        }
                    }
                    break
                case "Escape":
                    setOpen(false)
                    break
            }
        },
        [open, flatFilteredOptions, focusedIndex, handleSelect],
    )

    // Effect for external search
    React.useEffect(() => {
        if (onSearch && debouncedSearch.length >= minSearchLength) {
            onSearch(debouncedSearch)
        }
    }, [debouncedSearch, onSearch, minSearchLength])

    // Render option item
    const renderOptionItem = React.useCallback(
        (option: OptionType<T>, index: number) => {
            const isSelected = values.includes(option.value)
            const isFocused = index === focusedIndex

            return (
                <CommandItem
                    key={String(option.value)}
                    value={String(option.value)}
                    onSelect={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        option.disabled && "opacity-50 cursor-not-allowed",
                        isFocused && "bg-accent",
                        isSelected && "bg-accent/50",
                    )}
                    onMouseEnter={() => setFocusedIndex(index)}
                >
                    <div className="flex items-center gap-2 flex-1">
                        {renderOption ? (
                            renderOption(option, isSelected)
                        ) : (
                            <>
                                {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                                <div className="flex-1">
                                    <div className="font-medium">{option.label}</div>
                                    {option.description && <div className="text-sm text-muted-foreground">{option.description}</div>}
                                </div>
                            </>
                        )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                </CommandItem>
            )
        },
        [values, focusedIndex, handleSelect, renderOption],
    )

    // Render tags
    const renderTags = React.useCallback(() => {
        if (selectedOptions.length === 0) {
            return <span className="text-muted-foreground">{placeholder}</span>
        }

        if (renderValue) {
            return renderValue(selectedOptions)
        }

        const displayedOptions = selectedOptions.slice(0, maxDisplayedTags)
        const remainingCount = selectedOptions.length - maxDisplayedTags

        return (
            <div className="flex flex-wrap gap-1">
                {displayedOptions.map((option) => (
                    <div key={String(option.value)}>
                        {renderTag ? (
                            renderTag(option, () => handleRemoveTag(option.value))
                        ) : (
                            <Badge variant="secondary" className={cn("text-xs", tagClassName)}>
                                {option.label}
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveTag(option.value)
                                    }}
                                    className="h-4 w-4 p-0 mr-1 cursor-pointer opacity-70 hover:opacity-100"
                                    role="button"
                                    tabIndex={-1}
                                    aria-label={`Remove ${option.label}`}
                                >
                                    <X className="h-4 w-4" />
                                </span>
                            </Badge>
                        )}
                    </div>
                ))
                }
                {
                    remainingCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                            +{remainingCount} more
                        </Badge>
                    )
                }
            </div >
        )
    }, [selectedOptions, placeholder, renderValue, maxDisplayedTags, renderTag, tagClassName, handleRemoveTag])

    // Should use virtual scrolling
    const shouldUseVirtualScrolling = virtualScrolling && flatFilteredOptions.length > virtualScrollingThreshold

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className={cn("w-full", className)}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label={ariaLabel}
                    aria-describedby={ariaDescribedBy}
                    className={cn(
                        "w-full justify-between h-auto min-h-[40px] py-2 px-3",
                        !selectedOptions.length && "text-muted-foreground",
                        triggerClassName,
                    )}
                    disabled={disabled || isLoading}
                    onKeyDown={handleKeyDown}
                >
                    <div className="flex items-center justify-between w-full min-h-[24px]">
                        {isLoading ? (
                            <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>{loadingMessage}</span>
                            </div>
                        ) : (
                            <div className="flex-1 text-left overflow-hidden">{renderTags()}</div>
                        )}
                        <div className="flex items-center ml-2">
                            {selectedOptions.length > 0 && clearable && !isLoading && (
                                <span
                                    onClick={handleClearAll}
                                    className="h-4 w-4 p-0 mr-1 cursor-pointer opacity-70 hover:opacity-100"
                                    role="button"
                                    tabIndex={-1}
                                    aria-label="Clear selection"
                                >
                                    <X className="h-4 w-4" />
                                </span>
                            )}
                            {!isLoading && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-full p-0", contentClassName)}
                align="start"
                onEscapeKeyDown={() => setOpen(false)}
            >
                <Command shouldFilter={false} onKeyDown={handleKeyDown}>
                    {searchable && (
                        <div className="flex items-center border-b px-3">
                            <CommandInput
                                placeholder={searchPlaceholder}
                                value={search}
                                onValueChange={handleSearchChange}
                                className="border-none focus:ring-0 py-3"
                            />
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-6 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
                        </div>
                    ) : (
                        <CommandList>
                            <CommandEmpty>{emptySearchMessage}</CommandEmpty>

                            {shouldUseVirtualScrolling ? (
                                <div className="max-h-[300px]">
                                    <Virtuoso
                                        data={flatFilteredOptions}
                                        itemContent={(index, option) => renderOptionItem(option, index)}
                                        style={{ height: "300px" }}
                                    />
                                </div>
                            ) : (
                                <ScrollArea className="max-h-[300px]">
                                    {hasGroups ? (
                                        (filteredOptions as OptionGroupType<T>[]).map((group, groupIndex) => (
                                            <CommandGroup key={groupIndex} heading={group.label}>
                                                {group.options.map((option, optionIndex) => {
                                                    const globalIndex =
                                                        (filteredOptions as OptionGroupType<T>[])
                                                            .slice(0, groupIndex)
                                                            .reduce((acc, g) => acc + g.options.length, 0) + optionIndex
                                                    return renderOptionItem(option, globalIndex)
                                                })}
                                            </CommandGroup>
                                        ))
                                    ) : (
                                        <CommandGroup>
                                            {(filteredOptions as OptionType<T>[]).map((option, index) => renderOptionItem(option, index))}
                                        </CommandGroup>
                                    )}
                                </ScrollArea>
                            )}
                        </CommandList>
                    )}
                </Command>
            </PopoverContent>
        </Popover >
    )
}
