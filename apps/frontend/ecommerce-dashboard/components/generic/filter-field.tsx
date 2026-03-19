"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { FilterField } from "@/types/list-config"
import { formatVND } from "@/lib/utils/currency"
import { SingleSelect } from "../ui/select/single-select"
import { useFieldOptions } from "@/hooks/use-field-options"
import { vi } from "date-fns/locale"

interface FilterFieldProps {
    field: FilterField
    value: any // eslint-disable-line @typescript-eslint/no-explicit-any
    onChange: (id: string, value: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function FilterFieldComponent({ field, value, onChange }: FilterFieldProps) {
    const [localValue, setLocalValue] = useState(value)

    // Fetch options from API if optionsEndpoint is provided
    const {
        data: apiOptions,
        isLoading: isLoadingOptions
    } = useFieldOptions(
        field.optionsEndpoint,
        field.optionsValueField,
        field.optionsLabelField
    )

    // Combine static options with API options
    const options = field.optionsEndpoint && apiOptions ?
        [...(field.options || []), ...apiOptions] :
        field.options || []

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    const handleChange = (newValue: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        setLocalValue(newValue)
        onChange(field.id, newValue)
    }

    // Common loading state for select components
    const renderLoading = () => (
        <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Đang tải...</span>
        </div>
    )

    switch (field.type) {
        case "text":
            return (
                <div className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                        id={field.id}
                        value={localValue || ""}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                    />
                </div>
            )

        case "number":
            return (
                <div className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                        id={field.id}
                        type="number"
                        value={localValue || ""}
                        onChange={(e) => handleChange(Number(e.target.value))}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                    />
                </div>
            )
        case "select":
            return (
                <div className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <SingleSelect
                        value={localValue?.toString() || ""}
                        onChange={(value) => handleChange(value)}
                        options={options}
                        placeholder={field.placeholder || `Chọn ${field.label}`}
                        isLoading={isLoadingOptions}
                    />
                </div>
            )

        case "multiselect":
            return (
                <div className="space-y-2">
                    <Label className="block mb-2">{field.label}</Label>
                    {field.optionsEndpoint && isLoadingOptions ? (
                        renderLoading()
                    ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                            {options.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${field.id}-${option.value}`}
                                        checked={(localValue || []).includes(option.value)}
                                        onCheckedChange={(checked) => {
                                            const currentValues = Array.isArray(localValue) ? [...localValue] : []
                                            if (checked) {
                                                handleChange([...currentValues, option.value])
                                            } else {
                                                handleChange(currentValues.filter((id) => id !== option.value))
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`${field.id}-${option.value}`} className="text-sm font-normal">
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )

        case "checkbox":
            return (
                <div className="flex items-center space-x-2">
                    <Checkbox id={field.id} checked={!!localValue} onCheckedChange={(checked) => handleChange(!!checked)} />
                    <Label htmlFor={field.id}>{field.label}</Label>
                </div>
            )

        case "range":
            return (
                <div className="space-y-2">
                    <Label>
                        {field.label} (
                        {Array.isArray(localValue)
                            ? `${formatVND(localValue[0])} - ${formatVND(localValue[1])}`
                            : `${formatVND(field.min || 0)} - ${formatVND(field.max || 100)}`}
                        )
                    </Label>
                    <div className="pt-6 px-2">
                        <Slider
                            value={Array.isArray(localValue) ? localValue : [field.min || 0, field.max || 100]}
                            min={field.min || 0}
                            max={field.max || 100}
                            step={field.step || 1}
                            onValueChange={handleChange}
                        />
                    </div>
                </div>
            )

        case "date":
            return (
                <div className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id={field.id}
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !localValue && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {localValue
                                    ? format(new Date(localValue), "dd/MM/yyyy", { locale: vi })
                                    : field.placeholder || "Chọn ngày"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={localValue ? new Date(localValue) : undefined}
                                onSelect={(date) => handleChange(date ? format(date, "yyyy-MM-dd") : null)} // Chỉ lấy YYYY-MM-DD
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            )

        default:
            return null
    }
}