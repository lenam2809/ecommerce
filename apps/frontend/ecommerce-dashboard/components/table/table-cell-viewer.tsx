"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { IconTrendingUp } from "@tabler/icons-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { month: "Tháng 1", desktop: 186, mobile: 80 },
    { month: "Tháng 2", desktop: 305, mobile: 200 },
    { month: "Tháng 3", desktop: 237, mobile: 120 },
    { month: "Tháng 4", desktop: 73, mobile: 190 },
    { month: "Tháng 5", desktop: 209, mobile: 130 },
    { month: "Tháng 6", desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--primary)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function TableCellViewer({ item }: { item: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const isMobile = useIsMobile()

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground w-fit px-0 text-left">
                    {item.header}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>{item.header}</DrawerTitle>
                    <DrawerDescription>
                        Hiển thị tổng số lượt truy cập trong 6 tháng gần nhất
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    {!isMobile && (
                        <>
                            <ChartContainer config={chartConfig}>
                                <AreaChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{
                                        left: 0,
                                        right: 10,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                        hide
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Area
                                        dataKey="mobile"
                                        type="natural"
                                        fill="var(--color-mobile)"
                                        fillOpacity={0.6}
                                        stroke="var(--color-mobile)"
                                        stackId="a"
                                    />
                                    <Area
                                        dataKey="desktop"
                                        type="natural"
                                        fill="var(--color-desktop)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-desktop)"
                                        stackId="a"
                                    />
                                </AreaChart>
                            </ChartContainer>
                            <Separator />
                            <div className="grid gap-2">
                                <div className="flex gap-2 leading-none font-medium">
                                    Tăng 5.2% trong tháng này <IconTrendingUp className="size-4" />
                                </div>
                                <div className="text-muted-foreground">
                                    Hiển thị tổng số lượt truy cập trong 6 tháng gần nhất. Đây chỉ là
                                    văn bản ngẫu nhiên để kiểm tra bố cục. Nó trải dài nhiều dòng
                                    và sẽ tự động xuống dòng.
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="header">Tiêu đề</Label>
                            <Input id="header" defaultValue={item.header} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="type">Loại</Label>
                                <Select defaultValue={item.type}>
                                    <SelectTrigger id="type" className="w-full">
                                        <SelectValue placeholder="Chọn loại" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Table of Contents">Mục lục</SelectItem>
                                        <SelectItem value="Executive Summary">Tóm tắt</SelectItem>
                                        <SelectItem value="Technical Approach">Phương pháp kỹ thuật</SelectItem>
                                        <SelectItem value="Design">Thiết kế</SelectItem>
                                        <SelectItem value="Capabilities">Khả năng</SelectItem>
                                        <SelectItem value="Focus Documents">Tài liệu trọng tâm</SelectItem>
                                        <SelectItem value="Narrative">Mô tả</SelectItem>
                                        <SelectItem value="Cover Page">Trang bìa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select defaultValue={item.status}>
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Done">Hoàn thành</SelectItem>
                                        <SelectItem value="In Progress">Đang thực hiện</SelectItem>
                                        <SelectItem value="Not Started">Chưa bắt đầu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="target">Mục tiêu</Label>
                                <Input id="target" defaultValue={item.target} />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="limit">Giới hạn</Label>
                                <Input id="limit" defaultValue={item.limit} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="reviewer">Người kiểm duyệt</Label>
                            <Select defaultValue={item.reviewer}>
                                <SelectTrigger id="reviewer" className="w-full">
                                    <SelectValue placeholder="Chọn người kiểm duyệt" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                                    <SelectItem value="Jamik Tashpulatov">
                                        Jamik Tashpulatov
                                    </SelectItem>
                                    <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                </div>
                <DrawerFooter>
                    <Button>Gửi</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Xong</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}