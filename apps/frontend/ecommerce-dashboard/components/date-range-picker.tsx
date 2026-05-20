"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"

export interface DateRangePickerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    form: UseFormReturn<TFieldValues>
    name: TName
    label?: string
    placeholder?: string
    disabled?: boolean
    dateFormat?: string
    className?: string
    clearable?: boolean
    numberOfMonths?: number
    disablePastDates?: boolean
    disableFutureDates?: boolean
    minDate?: Date
    maxDate?: Date
    presets?: { label: string; value: DateRange }[]
    showPresets?: boolean
}

export function DateRangePicker<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    placeholder = "Chọn phạm vi ngày",
    disabled = false,
    dateFormat = "dd/MM/yyyy",
    className,
    clearable = true,
    numberOfMonths = 2,
    disablePastDates = false,
    disableFutureDates = false,
    minDate,
    maxDate,
    presets,
    showPresets = true,
}: DateRangePickerProps<TFieldValues, TName>) {
    const [open, setOpen] = React.useState(false)
    const [, setDate] = React.useState<DateRange | undefined>(form.getValues(name))
    const fieldValue = form.watch(name)

    // Default presets if none provided
    const defaultPresets = [
        { label: "Hôm nay", value: { from: new Date(), to: new Date() } },
        {
            label: "Hôm qua",
            value: {
                from: new Date(new Date().setDate(new Date().getDate() - 1)),
                to: new Date(new Date().setDate(new Date().getDate() - 1)),
            },
        },
        {
            label: "7 ngày qua",
            value: {
                from: new Date(new Date().setDate(new Date().getDate() - 6)),
                to: new Date(),
            },
        },
        {
            label: "30 ngày qua",
            value: {
                from: new Date(new Date().setDate(new Date().getDate() - 29)),
                to: new Date(),
            },
        },
        {
            label: "Tháng này",
            value: {
                from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                to: new Date(),
            },
        },
        {
            label: "Năm nay",
            value: {
                from: new Date(new Date().getFullYear(), 0, 1), // 1/1 của năm hiện tại
                to: new Date(new Date().getFullYear(), 11, 31)
            }
        }
    ]

    const activePresets = presets || defaultPresets

    // Function to disable dates based on props
    const isDateDisabled = React.useCallback(
        (date: Date) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (disablePastDates && date < today) return true
            if (disableFutureDates && date > today) return true
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true

            return false
        },
        [disablePastDates, disableFutureDates, minDate, maxDate],
    )

    // Update input values when field value changes
    React.useEffect(() => {
        const value = form.getValues(name)

        setDate(value)
    }, [fieldValue, form, name])


    // Apply preset
    const handlePresetClick = (preset: DateRange) => {
        form.setValue(name, preset as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
        setDate(preset)
        setOpen(false)
    }

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <div className="relative">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                            field.value && "border-primary",
                                        )}
                                        disabled={disabled}
                                        aria-expanded={open}
                                        aria-haspopup="dialog"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value?.from ? (
                                            field.value.to ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-medium">
                                                        {format(field.value.from, dateFormat)}
                                                    </Badge>
                                                    <span>đến ngày</span>
                                                    <Badge variant="outline" className="font-medium">
                                                        {format(field.value.to, dateFormat)}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                format(field.value.from, dateFormat)
                                            )
                                        ) : (
                                            <span>{placeholder}</span>
                                        )}
                                        {clearable && field.value && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    form.setValue(name, undefined as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                        shouldTouch: true,
                                                    })
                                                    setDate(undefined)
                                                }}
                                                aria-label="Xóa ngày đã chọn"
                                                disabled={disabled}
                                                type="button"
                                            >
                                                <X className="h-4 w-4 opacity-50 hover:opacity-100" />
                                            </Button>
                                        )}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="flex flex-col sm:flex-row">
                                    {showPresets && (
                                        <div className="border-r p-3 space-y-2">
                                            <div className="text-sm font-medium">Cài đặt trước</div>
                                            <div className="flex flex-col gap-1">
                                                {activePresets.map((preset, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="justify-start font-normal"
                                                        onClick={() => handlePresetClick(preset.value)}
                                                    >
                                                        {preset.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={field.value?.from}
                                            selected={field.value}
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate)
                                                form.setValue(name, selectedDate as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                })
                                            }}
                                            numberOfMonths={numberOfMonths}
                                            disabled={disabled || isDateDisabled}
                                            className="rounded-md border shadow-md"
                                        />
                                        <div className="pt-3">
                                            <Button className="w-full" onClick={() => setOpen(false)}>
                                                Xác nhận lựa chọn
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
