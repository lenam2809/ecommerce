"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type OptionType<T = string> = {
    value: T
    label: string
    disabled?: boolean
}

export type OptionGroupType<T = string> = {
    label: string
    options: OptionType<T>[]
}

export interface SingleSelectProps<T = string> {
    id?: string,
    options: OptionType<T>[] | OptionGroupType<T>[]
    value: T | null
    onChange: (value: T | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptySearchMessage?: string
    disabled?: boolean
    className?: string
    triggerClassName?: string
    contentClassName?: string
    renderOption?: (option: OptionType<T>, isSelected: boolean) => React.ReactNode
    renderValue?: (option: OptionType<T> | null) => React.ReactNode
    clearable?: boolean
    searchable?: boolean
    defaultValue?: T | null
    isLoading?: boolean
    loadingMessage?: string
}

export function SingleSelect<T = string>({
    id,
    options,
    value,
    onChange,
    placeholder = "Chọn một tùy chọn...",
    searchPlaceholder = "Nhập để tìm kiếm...",
    emptySearchMessage = "Không tìm thấy tùy chọn nào.",
    disabled = false,
    className,
    triggerClassName,
    contentClassName,
    renderOption,
    renderValue,
    clearable = true,
    searchable = true,
    defaultValue = null,
    isLoading = false,
    loadingMessage = "Đang tải...",
}: SingleSelectProps<T>) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")
    const [hasGroups, setHasGroups] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState<T | null>(defaultValue)

    // Use internal value if the component is uncontrolled
    const effectiveValue = value !== undefined ? value : internalValue

    // Determine if options are grouped
    React.useEffect(() => {
        if (options.length === 0) {
            setHasGroups(false)
            return
        }

        setHasGroups("options" in options[0])
    }, [options])

    // Get flat list of all options
    const allOptions = React.useMemo(() => {
        if (!hasGroups) {
            return options as OptionType<T>[]
        }
        return (options as OptionGroupType<T>[]).flatMap((group) => group.options)
    }, [options, hasGroups])

    // Find the selected option
    const selectedOption = React.useMemo(() => {
        if (effectiveValue === null) return null
        return allOptions.find((option) => option.value === effectiveValue) || null
    }, [effectiveValue, allOptions])

    // Filter options based on search value
    const filteredOptions = React.useMemo(() => {
        if (!searchValue) {
            return options
        }

        const lowerSearchValue = searchValue.toLowerCase()

        if (hasGroups) {
            return (options as OptionGroupType<T>[])
                .map((group) => ({
                    ...group,
                    options: group.options.filter((option) => option.label.toLowerCase().includes(lowerSearchValue)),
                }))
                .filter((group) => group.options.length > 0)
        }

        return (options as OptionType<T>[]).filter((option) => option.label.toLowerCase().includes(lowerSearchValue))
    }, [searchValue, options, hasGroups])

    // Handle selection
    const handleSelect = (selectedValue: T) => {
        // If the value is already selected and clearable is true, clear the selection
        if (effectiveValue === selectedValue && clearable) {
            onChange(null)
            setInternalValue(null)
        } else {
            onChange(selectedValue)
            setInternalValue(selectedValue)
        }
        setOpen(false)
        setSearchValue("")
    }

    // Handle clear button click
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(null)
        setInternalValue(null)
        setSearchValue("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <Button
                    id={id} // Add this line
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", !selectedOption && "text-muted-foreground", triggerClassName, className)}
                    disabled={disabled || isLoading}
                    aria-label={selectedOption ? `Selected: ${selectedOption.label}` : placeholder}
                >
                    <div className="flex items-center justify-between w-full overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>{loadingMessage}</span>
                            </div>
                        ) : (
                            <div className="truncate">
                                {selectedOption ? (renderValue ? renderValue(selectedOption) : selectedOption.label) : placeholder}
                            </div>
                        )}
                        <div className="flex items-center">
                            {selectedOption && clearable && !isLoading && (
                                <span
                                    onClick={handleClear}
                                    className="h-4 w-4 p-0 mr-1 cursor-pointer opacity-70 hover:opacity-100"
                                    role="button"
                                    tabIndex={-1}
                                    aria-label="Clear selection"
                                >
                                    <X className="h-4 w-4" />
                                </span>
                            )}
                            {!isLoading && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />}
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-full p-0", contentClassName)}
                align="start"
                onEscapeKeyDown={() => setOpen(false)}
            >
                <Command shouldFilter={false}>
                    {searchable && (
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onValueChange={setSearchValue}
                            className="border-none focus:ring-0"
                        />
                    )}
                    <CommandList>
                        {isLoading ? (
                            <div className="py-6 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p>{loadingMessage}</p>
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>{emptySearchMessage}</CommandEmpty>
                                {hasGroups ? (
                                    (filteredOptions as OptionGroupType<T>[]).map((group, groupIndex) => (
                                        <CommandGroup key={groupIndex} heading={group.label}>
                                            {group.options.map((option) => (
                                                <CommandItem
                                                    key={String(option.value)}
                                                    value={String(option.value)}
                                                    onSelect={() => handleSelect(option.value)}
                                                    disabled={option.disabled}
                                                    className={cn("flex items-center gap-2", option.disabled && "opacity-50 cursor-not-allowed")}
                                                >
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {renderOption ? (
                                                            renderOption(option, option.value === effectiveValue)
                                                        ) : (
                                                            <span className="flex-1">{option.label}</span>
                                                        )}
                                                    </div>
                                                    {option.value === effectiveValue && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    ))
                                ) : (
                                    <CommandGroup>
                                        {(filteredOptions as OptionType<T>[]).map((option) => (
                                            <CommandItem
                                                key={String(option.value)}
                                                value={String(option.value)}
                                                onSelect={() => handleSelect(option.value)}
                                                disabled={option.disabled}
                                                className={cn("flex items-center gap-2", option.disabled && "opacity-50 cursor-not-allowed")}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {renderOption ? (
                                                        renderOption(option, option.value === effectiveValue)
                                                    ) : (
                                                        <span className="flex-1">{option.label}</span>
                                                    )}
                                                </div>
                                                {option.value === effectiveValue && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}