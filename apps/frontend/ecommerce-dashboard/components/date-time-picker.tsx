"use client"

import * as React from "react"
import { format, isValid, setHours, setMinutes } from "date-fns"
import { CalendarIcon, Clock, X } from "lucide-react"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface DateTimePickerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    form: UseFormReturn<TFieldValues>
    name: TName
    label?: string
    placeholder?: string
    disabled?: boolean
    dateFormat?: string
    timeFormat?: string
    className?: string
    clearable?: boolean
    minuteStep?: number
    showSeconds?: boolean
    use24HourTime?: boolean
    disablePastDates?: boolean
    disableFutureDates?: boolean
    minDate?: Date
    maxDate?: Date
    showTodayButton?: boolean
}

export function DateTimePicker<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    placeholder = "Chọn ngày và giờ",
    disabled = false,
    dateFormat = "dd/MM/yyyy",
    timeFormat = "p",
    className,
    clearable = true,
    minuteStep = 5,
    // showSeconds = false,
    use24HourTime = false,
    disablePastDates = false,
    disableFutureDates = false,
    minDate,
    maxDate,
    showTodayButton = true,
}: DateTimePickerProps<TFieldValues, TName>) {
    const [open, setOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(form.getValues(name))
    const [activeTab, setActiveTab] = React.useState<string>("date")
    const fieldValue = form.watch(name)

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

    // Update input value when field value changes
    React.useEffect(() => {
        const value = form.getValues(name)
        if (value && isValid(value)) {
            setSelectedDate(value)
        } else {
            setSelectedDate(undefined)
        }
    }, [fieldValue, form, name])

    // Handle date selection
    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)

        if (!date) {
            form.setValue(name, undefined as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            })
            return
        }

        // If we already have a value, preserve the time
        const currentValue = form.getValues(name)
        if (currentValue) {
            const newDate = new Date(date)
            newDate.setHours(currentValue.getHours())
            newDate.setMinutes(currentValue.getMinutes())
            newDate.setSeconds(currentValue.getSeconds())

            form.setValue(name, newDate as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            })
        } else {
            // Set default time to current time
            form.setValue(name, date as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            })
        }

        // Switch to time tab after date selection
        setActiveTab("time")
    }

    // Handle hour change
    const handleHourChange = (value: number[]) => {
        const currentValue = form.getValues(name) || selectedDate || new Date()
        const newDate = setHours(new Date(currentValue), value[0])

        form.setValue(name, newDate as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
        setSelectedDate(newDate)
    }

    // Handle minute change
    const handleMinuteChange = (value: number[]) => {
        const currentValue = form.getValues(name) || selectedDate || new Date()
        const newDate = setMinutes(new Date(currentValue), value[0])

        form.setValue(name, newDate as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
        setSelectedDate(newDate)
    }

    // Set current date and time
    const handleSelectNow = () => {
        const now = new Date()
        if (!isDateDisabled(now)) {
            form.setValue(name, now as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            })
            setSelectedDate(now)
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
                                        <div className="flex items-center">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? (
                                                <span className="font-medium">{format(field.value, `${dateFormat} ${timeFormat}`)}</span>
                                            ) : (
                                                <span>{placeholder}</span>
                                            )}
                                        </div>
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
                                                    setSelectedDate(undefined)
                                                }}
                                                aria-label="Xóa ngày và giờ"
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
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="flex items-center justify-between px-3 pt-3">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="date" className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>Ngày</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="time" className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>Giờ</span>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="date" className="p-3">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={handleDateSelect}
                                            disabled={disabled || isDateDisabled}
                                            initialFocus
                                            className="rounded-md border shadow-md"
                                        />
                                        {showTodayButton && (
                                            <div className="pt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={handleSelectNow}
                                                    disabled={disablePastDates || (minDate && new Date() < minDate)}
                                                >
                                                    Bây giờ
                                                </Button>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="time" className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Hours</span>
                                                <span className="text-sm font-mono bg-muted px-2 py-1 rounded-md">
                                                    {field.value ? format(field.value, use24HourTime ? "HH" : "hh") : "00"}
                                                </span>
                                            </div>
                                            <Slider
                                                value={[field.value ? field.value.getHours() : 0]}
                                                min={0}
                                                max={23}
                                                step={1}
                                                onValueChange={handleHourChange}
                                                disabled={disabled || !selectedDate}
                                                aria-label="Select hour"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>0</span>
                                                <span>6</span>
                                                <span>12</span>
                                                <span>18</span>
                                                <span>23</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Minutes</span>
                                                <span className="text-sm font-mono bg-muted px-2 py-1 rounded-md">
                                                    {field.value ? format(field.value, "mm") : "00"}
                                                </span>
                                            </div>
                                            <Slider
                                                value={[field.value ? Math.floor(field.value.getMinutes() / minuteStep) * minuteStep : 0]}
                                                min={0}
                                                max={59}
                                                step={minuteStep}
                                                onValueChange={handleMinuteChange}
                                                disabled={disabled || !selectedDate}
                                                aria-label="Select minute"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>0</span>
                                                <span>15</span>
                                                <span>30</span>
                                                <span>45</span>
                                                <span>59</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button className="w-full" onClick={() => setOpen(false)} disabled={!selectedDate}>
                                                Xác nhận
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
