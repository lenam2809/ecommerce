"use client"

import { logger } from '@/lib/logger'
import { format, isValid } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import * as React from "react"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export interface DatePickerProps<
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
    showTodayButton?: boolean
    disablePastDates?: boolean
    disableFutureDates?: boolean
    minDate?: Date
    maxDate?: Date
}

export function DatePicker<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    placeholder = "Chọn ngày",
    disabled = false,
    dateFormat = "dd/MM/yyyy",
    className,
    clearable = true,
    showTodayButton = true,
    disablePastDates = false,
    disableFutureDates = false,
    minDate,
    maxDate,
}: DatePickerProps<TFieldValues, TName>) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    // Hàm vô hiệu hóa ngày dựa trên props
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

    // Xử lý nhập liệu thủ công
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleInputBlur = () => {
        try {
            const date = new Date(inputValue)
            if (isValid(date) && !isDateDisabled(date)) {
                form.setValue(name, date as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                })
            } else {
                // Reset to previous valid value or clear if invalid
                const value = form.getValues(name)
                setInputValue(value && isValid(value) ? format(value, dateFormat) : "")
            }
        } catch (error) {
            logger.error("Invalid date format:", error)
            // Reset to previous valid value or clear if invalid
            const value = form.getValues(name)
            setInputValue(value && isValid(value) ? format(value, dateFormat) : "")
        }
    }

    // Cập nhật giá trị nhập liệu khi giá trị trường thay đổi
    React.useEffect(() => {
        const value = form.getValues(name)
        if (value && isValid(value)) {
            setInputValue(format(value, dateFormat))
        } else {
            setInputValue("")
        }
    }, [form.getValues(name), dateFormat, form, name])

    // Đặt ngày hôm nay
    const handleSelectToday = () => {
        const today = new Date()
        if (!isDateDisabled(today)) {
            form.setValue(name, today as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            })
            setOpen(false)
        }
    }

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <div className="relative">
                        <Popover open={open} onOpenChange={setOpen} modal={true}>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        className={cn(
                                            "w-full pl-10 pr-10 text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                            field.value && "border-primary",
                                        )}
                                        placeholder={placeholder}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur}
                                        disabled={disabled}
                                        aria-expanded={open}
                                        aria-haspopup="dialog"
                                        onFocus={() => !disabled && setOpen(true)}
                                        readOnly
                                    />
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                            disabled={disabled}
                                            type="button"
                                            aria-label="Mở lịch"
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    {clearable && field.value && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                                form.setValue(name, undefined as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                })
                                                setInputValue("")
                                            }}
                                            disabled={disabled}
                                            type="button"
                                            aria-label="Xóa ngày"
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <X className="h-4 w-4 opacity-50 hover:opacity-100" />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                            <PopoverContent
                                className="w-auto p-0 z-[60]"
                                align="start"
                                side="bottom"
                                sideOffset={4}
                                avoidCollisions={true}
                                onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                        field.onChange(date)
                                        if (date) {
                                            setInputValue(format(date, dateFormat))
                                        }
                                        setOpen(false)
                                    }}
                                    disabled={disabled || isDateDisabled}
                                    initialFocus
                                    className="rounded-md border shadow-md"
                                />
                                {showTodayButton && (
                                    <div className="p-3 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full bg-transparent"
                                            onClick={handleSelectToday}
                                            disabled={disablePastDates || (minDate && new Date() < minDate)}
                                        >
                                            Hôm nay
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
