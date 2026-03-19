"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CalendarDateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (range: { from: Date; to: Date }) => void
  initialDateFrom?: Date
  initialDateTo?: Date
}

export function CalendarDateRangePicker({
  className,
  onChange,
  initialDateFrom,
  initialDateTo,
}: CalendarDateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialDateFrom || new Date(2023, 0, 1),
    to: initialDateTo || new Date(),
  })

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (newDate?.from && newDate?.to && onChange) {
      onChange({ from: newDate.from, to: newDate.to })
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Chọn một ngày</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}