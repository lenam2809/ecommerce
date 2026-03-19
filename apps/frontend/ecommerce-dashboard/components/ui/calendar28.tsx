"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | null) {
    if (!date) return ""
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}

function parseDateFromString(value: string): Date | null {
    const parts = value.split("/")
    if (parts.length !== 3) return null
    const [day, month, year] = parts.map(Number)
    if (!day || !month || !year) return null

    const date = new Date(year, month - 1, day)
    return isNaN(date.getTime()) ? null : date
}

function isValidDate(date: Date | null | undefined): boolean {
    return !!date && !isNaN(date.getTime())
}

function isFutureDate(date: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
}

interface Calendar28Props {
    selected: Date | null | undefined
    onSelect: (date: Date | null | undefined) => void
    label?: string
    placeholder?: string
    id?: string
    disabled?: boolean
    disablePastDate?: boolean
}

export function Calendar28({
    selected,
    onSelect,
    label = "Chọn ngày",
    placeholder = "dd/mm/yyyy",
    id = "date",
    disabled = false,
    disablePastDate = false,
}: Calendar28Props) {
    const [open, setOpen] = React.useState(false)
    const initialDate = selected ?? new Date()
    const [month, setMonth] = React.useState<Date | undefined>(initialDate)
    const [value, setValue] = React.useState(formatDate(initialDate))

    React.useEffect(() => {
        const dateToUse = selected ?? new Date()
        setValue(formatDate(dateToUse))
        setMonth(dateToUse)
    }, [selected])

    return (
        <div className="flex flex-col gap-3">
            {label && (
                <Label htmlFor={id} className="px-1">
                    {label}
                </Label>
            )}
            <div className="relative flex gap-2">
                <Input
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    className="bg-background pr-10"
                    disabled={disabled}
                    onChange={(e) => {
                        const input = e.target.value
                        setValue(input)

                        const parsedDate = parseDateFromString(input)
                        if (isValidDate(parsedDate)) {
                            if (disablePastDate && !isFutureDate(parsedDate!)) return
                            onSelect(parsedDate!)
                            setMonth(parsedDate!)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id={`${id}-picker`}
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                            disabled={disabled}
                        >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Chọn ngày</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={selected ?? new Date()}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(selectedDate) => {
                                if (disablePastDate && selectedDate && !isFutureDate(selectedDate)) return
                                onSelect(selectedDate ?? new Date())
                                setValue(formatDate(selectedDate ?? new Date()))
                                setOpen(false)
                            }}
                            disabled={disablePastDate ? (date) => !isFutureDate(date) : undefined}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}