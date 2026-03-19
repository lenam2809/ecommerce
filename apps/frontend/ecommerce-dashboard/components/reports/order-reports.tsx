"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderStatusChart } from "@/components/reports/charts/order-status-chart"
import { OrderRatioChart } from "@/components/reports/charts/order-ratio-chart"
import { AverageOrderValueChart } from "@/components/reports/charts/average-order-value-chart"
import { OrderStatusFilters, OrderRatioFilters, AverageOrderValueFilters, OrderOverviewFilters, RecentOrdersFilters } from "@/types/report"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOrderOverview, useRecentOrders } from "@/hooks/use-report"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar28 } from "../ui/calendar28"
import { formatVND } from "@/lib/utils/currency"

export default function OrderReports() {
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const getLastDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    const currentDate = new Date();

    const [statusFilters, setStatusFilters] = useState<OrderStatusFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: new Date()
    })
    const [ratioFilters, setRatioFilters] = useState<OrderRatioFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: getLastDayOfMonth(currentDate),
        monthsCount: 12
    })
    const [aovFilters, setAovFilters] = useState<AverageOrderValueFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: new Date(),
        monthsCount: 12
    })
    const [overviewFilters, setOverviewFilters] = useState<OrderOverviewFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: getLastDayOfMonth(currentDate),
    })
    const [orderFilters, setOrderFilters] = useState<RecentOrdersFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: new Date(),
        limit: 5
    })

    const { data: overviewDataResult, isLoading: overviewLoading, error: overviewError } = useOrderOverview(overviewFilters)
    const { data: ordersDataResult, isLoading: ordersLoading, error: ordersError } = useRecentOrders(orderFilters)

    const overviewData = overviewDataResult?.data;
    const ordersData = ordersDataResult?.data;


    const handleRatioFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setRatioFilters(prev => ({
            ...prev,
            [name]: name === 'topN' || name === 'categoryId' ? parseInt(value) : value
        }))
    }

    const handleAovFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setAovFilters(prev => ({
            ...prev,
            [name]: name === 'topN' ? parseInt(value) : value
        }))
    }

    const handleOrderFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setOrderFilters(prev => ({
            ...prev,
            [name]: name === 'limit' ? parseInt(value) : value
        }))
    }

    return (
        <Tabs defaultValue="total" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="total">Tổng quan đơn hàng</TabsTrigger>
                <TabsTrigger value="status">Trạng thái đơn hàng</TabsTrigger>
                <TabsTrigger value="ratio">Tỷ lệ đơn hàng</TabsTrigger>
                <TabsTrigger value="aov">Giá trị trung bình</TabsTrigger>
            </TabsList>
            <TabsContent value="total" className="space-y-4 mt-4">
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Calendar28
                            selected={overviewFilters.startDate ?? null}
                            onSelect={(date) => {
                                setOverviewFilters(prev => ({
                                    ...prev,
                                    startDate: date ?? undefined
                                }))
                            }}
                            label="Ngày bắt đầu"
                            id="overview-startDate"
                        />

                    </div>
                    <div>
                        <Calendar28
                            selected={overviewFilters.endDate ?? null}
                            onSelect={(date) => {
                                setOverviewFilters(prev => ({
                                    ...prev,
                                    endDate: date ?? undefined
                                }))
                            }}
                            label="Ngày kết thúc"
                            id="overview-endDate"
                        />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M4 4h16v16H4z" />
                                <path d="M9 4v16" />
                                <path d="M14 4v16" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{overviewData?.totalOrders}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.totalGrowthPercentage && overviewData?.totalGrowthPercentage >= 0 ? '+' : ''}{overviewData?.totalGrowthPercentage}% so với tháng trước
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Đơn hoàn thành</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{overviewData?.completedOrders}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.completedGrowthPercentage && overviewData?.completedGrowthPercentage >= 0 ? '+' : ''}{overviewData?.completedGrowthPercentage}% so với tháng trước
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Đơn đang chờ</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{overviewData?.pendingOrders}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.pendingGrowthPercentage && overviewData?.pendingGrowthPercentage >= 0 ? '+' : ''}{overviewData?.pendingGrowthPercentage}% so với tháng trước
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Đơn đã hủy</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{overviewData?.canceledOrders}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.canceledGrowthPercentage && overviewData?.canceledGrowthPercentage >= 0 ? '+' : ''}{overviewData?.canceledGrowthPercentage}% so với tháng trước
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Tổng quan Đơn hàng</CardTitle>
                            <CardDescription>Trạng thái đơn hàng theo thời gian</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Calendar28
                                        selected={statusFilters.startDate ?? null}
                                        onSelect={(date) => {
                                            setStatusFilters(prev => ({
                                                ...prev,
                                                startDate: date ?? undefined
                                            }))
                                        }}
                                        label="Ngày bắt đầu"
                                        id="status-startDate"
                                    />
                                </div>
                                <div>
                                    <Calendar28
                                        selected={statusFilters.endDate ?? null}
                                        onSelect={(date) => {
                                            setStatusFilters(prev => ({
                                                ...prev,
                                                endDate: date ?? undefined
                                            }))
                                        }}
                                        label="Ngày kết thúc"
                                        id="status-endDate"
                                    />
                                </div>
                            </div>
                            <OrderStatusChart filters={statusFilters} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Đơn hàng gần đây</CardTitle>
                            <CardDescription>
                                {ordersLoading ? (
                                    <Skeleton className="h-4 w-[100px]" />
                                ) : ordersError ? (
                                    <div className="text-red-500">Lỗi tải dữ liệu</div>
                                ) : (
                                    `Bạn đã thực hiện ${ordersData?.length || 0} đơn hàng gần đây.`
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Calendar28
                                        selected={orderFilters.startDate ?? null}
                                        onSelect={(date) => {
                                            setOrderFilters(prev => ({
                                                ...prev,
                                                startDate: date ?? new Date()
                                            }))
                                        }}
                                        label="Ngày bắt đầu"
                                        id="order-startDate"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="order-limit">Số đơn hàng</Label>
                                    <Input
                                        id="order-limit"
                                        name="limit"
                                        type="number"
                                        min="1"
                                        max="10"
                                        onChange={handleOrderFilterChange}
                                        value={orderFilters.limit || 5}
                                    />
                                </div>
                            </div>
                            <div className="space-y-8">
                                {ordersLoading ? (
                                    [...Array(5)].map((_, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <Skeleton className="h-4 w-[150px]" />
                                                <Skeleton className="h-3 w-[100px]" />
                                            </div>
                                            <Skeleton className="ml-auto h-4 w-[80px]" />
                                        </div>
                                    ))
                                ) : ordersError ? (
                                    <div className="text-red-500 text-center">Lỗi tải dữ liệu</div>
                                ) : (
                                    ordersData?.map((order, index) => (
                                        <div key={order.orderId + index} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm text-muted-foreground">{order.customerName}</p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                {order.itemCount} mặt hàng, {formatVND(order.totalAmount)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="status" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Trạng thái Đơn hàng</CardTitle>
                        <CardDescription>Phân bố trạng thái đơn hàng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Calendar28
                                    selected={statusFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setStatusFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? new Date()
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="status-startDate"
                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={statusFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setStatusFilters(prev => ({
                                            ...prev,
                                            endDate: date ?? new Date()
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="status-endDate"
                                />
                            </div>
                        </div>
                        <OrderStatusChart filters={statusFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="ratio" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Tỷ lệ Đơn hàng</CardTitle>
                        <CardDescription>Tỷ lệ đơn hàng theo trạng thái</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Calendar28
                                    selected={ratioFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setRatioFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? new Date()
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="ratio-startDate"
                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={ratioFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setRatioFilters(prev => ({
                                            ...prev,
                                            endDate: date ?? new Date()
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="ratio-endDate"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="ratio-monthsCount">Số lượng</Label>
                                <Input
                                    id="ratio-monthsCount"
                                    name="monthsCount"
                                    type="number"
                                    min="1"
                                    max="50"
                                    onChange={handleRatioFilterChange}
                                    value={ratioFilters.monthsCount}
                                />
                            </div>
                        </div>
                        <OrderRatioChart filters={ratioFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="aov" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Giá trị Trung bình Đơn hàng</CardTitle>
                        <CardDescription>Giá trị trung bình của đơn hàng theo thời gian</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Calendar28
                                    selected={aovFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setAovFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? new Date()
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="aov-startDate"
                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={aovFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setAovFilters(prev => ({
                                            ...prev,
                                            endDate: date ?? new Date()
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="aov-endDate"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="aov-monthsCount">Số tháng</Label>
                                <Input
                                    id="aov-monthsCount"
                                    name="monthsCount"
                                    type="number"
                                    min="1"
                                    max="12"
                                    onChange={handleAovFilterChange}
                                    value={aovFilters.monthsCount}
                                />
                            </div>
                        </div>
                        <AverageOrderValueChart filters={aovFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}