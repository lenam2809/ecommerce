"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface ChartAreaInteractiveProps {
  title?: string
  description?: string
  data?: Array<{
    date: string
    value: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }>
  timeRangeOptions?: {
    label: string
    value: string
  }[]
  defaultTimeRange?: string
  height?: number | string
  colors?: {
    desktop?: string
    mobile?: string
  }
  showControls?: boolean
}

export const description = "Biểu đồ vùng tương tác"

const defaultChartData = [
  { date: "2024-04-01", value: 222 },
  { date: "2024-04-02", value: 974 },
  { date: "2024-04-03", value: 167 },
  { date: "2024-04-04", value: 242 },
  { date: "2024-04-05", value: 373 },
  { date: "2024-04-06", value: 301 },
  { date: "2024-04-07", value: 245 },
  { date: "2024-04-08", value: 409 },
  { date: "2024-04-09", value: 594 },
  { date: "2024-04-10", value: 261 },
  { date: "2024-04-11", value: 327 },
  { date: "2024-04-12", value: 292 },
  { date: "2024-04-13", value: 342 },
  { date: "2024-04-14", value: 137 },
  { date: "2024-04-15", value: 120 },
  { date: "2024-04-16", value: 138 },
  { date: "2024-04-17", value: 446 },
  { date: "2024-04-18", value: 364 },
  { date: "2024-04-19", value: 243 },
  { date: "2024-04-20", value: 894 },
  { date: "2024-04-21", value: 137 },
  { date: "2024-04-22", value: 224 },
  { date: "2024-04-23", value: 138 },
  { date: "2024-04-24", value: 387 },
  { date: "2024-04-25", value: 215 },
  { date: "2024-04-26", value: 754 },
  { date: "2024-04-27", value: 383 },
  { date: "2024-04-28", value: 122 },
  { date: "2024-04-29", value: 315 },
  { date: "2024-04-30", value: 454 },
  { date: "2024-05-01", value: 165 },
  { date: "2024-05-02", value: 293 },
  { date: "2024-05-03", value: 247 },
  { date: "2024-05-04", value: 385 },
  { date: "2024-05-05", value: 481 },
  { date: "2024-05-06", value: 498 },
  { date: "2024-05-07", value: 388 },
  { date: "2024-05-08", value: 149 },
  { date: "2024-05-09", value: 227 },
  { date: "2024-05-10", value: 293 },
  { date: "2024-05-11", value: 335 },
  { date: "2024-05-12", value: 197 },
  { date: "2024-05-13", value: 197 },
  { date: "2024-05-14", value: 448 },
  { date: "2024-05-15", value: 473 },
  { date: "2024-05-16", value: 338 },
  { date: "2024-05-17", value: 499 },
  { date: "2024-05-18", value: 315 },
  { date: "2024-05-19", value: 235 },
  { date: "2024-05-20", value: 177 },
  { date: "2024-05-21", value: 824 },
  { date: "2024-05-22", value: 814 },
  { date: "2024-05-23", value: 252 },
  { date: "2024-05-24", value: 294 },
  { date: "2024-05-25", value: 201 },
  { date: "2024-05-26", value: 213 },
  { date: "2024-05-27", value: 420 },
  { date: "2024-05-28", value: 233 },
  { date: "2024-05-29", value: 784 },
  { date: "2024-05-30", value: 340 },
  { date: "2024-05-31", value: 178 },
  { date: "2024-06-01", value: 178 },
  { date: "2024-06-02", value: 470 },
  { date: "2024-06-03", value: 103 },
  { date: "2024-06-04", value: 439 },
  { date: "2024-06-05", value: 884 },
  { date: "2024-06-06", value: 294 },
  { date: "2024-06-07", value: 323 },
  { date: "2024-06-08", value: 385 },
  { date: "2024-06-09", value: 438 },
  { date: "2024-06-10", value: 155 },
  { date: "2024-06-11", value: 924 },
  { date: "2024-06-12", value: 492 },
  { date: "2024-06-13", value: 814 },
  { date: "2024-06-14", value: 426 },
  { date: "2024-06-15", value: 307 },
  { date: "2024-06-16", value: 371 },
  { date: "2024-06-17", value: 475 },
  { date: "2024-06-18", value: 107 },
  { date: "2024-06-19", value: 341 },
  { date: "2024-06-20", value: 408 },
  { date: "2024-06-21", value: 169 },
  { date: "2024-06-22", value: 317 },
  { date: "2024-06-23", value: 480 },
  { date: "2024-06-24", value: 132 },
  { date: "2024-06-25", value: 141 },
  { date: "2024-06-26", value: 434 },
  { date: "2024-06-27", value: 448 },
  { date: "2024-06-28", value: 149 },
  { date: "2024-06-29", value: 103 },
  { date: "2024-06-30", value: 446 },
]


const defaultChartConfig = {
  visitors: {
    label: "Visitors",
  },
  value: {
    label: "giá trị",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const defaultTimeRangeOptions = [
  { label: "3 tháng qua", value: "90d" },
  { label: "30 ngày qua", value: "30d" },
  { label: "7 ngày qua", value: "7d" },
]

export function ChartAreaInteractive({
  title = "Tổng số khách hàng truy cập",
  description = "Tổng cộng trong 3 tháng qua",
  data = defaultChartData,
  timeRangeOptions = defaultTimeRangeOptions,
  defaultTimeRange = "90d",
  height = 250,
  colors = {
    desktop: "var(--color-desktop)",
    mobile: "var(--color-mobile)",
  },
  showControls = true,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState(defaultTimeRange)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const chartConfig = {
    ...defaultChartConfig,
    desktop: {
      ...defaultChartConfig.value,
      color: colors.desktop,
    },
    mobile: {
      ...defaultChartConfig.mobile,
      color: colors.mobile,
    },
  }

  // Hàm định dạng ngày tháng tiếng Việt
  const formatVietnameseDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day} Th${month}`;
  };

  // Hàm định dạng tooltip tiếng Việt
  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('vi-VN', options);
  };


  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{description}</span>
          <span className="@[540px]/card:hidden">3 tháng qua</span>
        </CardDescription>
        {showControls && (
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              {timeRangeOptions.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Chọn một giá trị"
              >
                <SelectValue
                  placeholder={
                    timeRangeOptions.find((opt) => opt.value === defaultTimeRange)
                      ?.label || "3 tháng qua"
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {timeRangeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height }}
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors.desktop}
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor={colors.desktop}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors.mobile}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colors.mobile}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatVietnameseDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`
                }
                return value
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={formatTooltipDate}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillMobile)"
              stroke={colors.mobile}
              stackId="a"
            />
            {/* <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke={colors.desktop}
              stackId="a"
            /> */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}