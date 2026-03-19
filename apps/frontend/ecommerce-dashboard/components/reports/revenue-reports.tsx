"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevenueChart } from "@/components/reports/charts/revenue-chart"
import { RevenueComparisonChart } from "@/components/reports/charts/revenue-comparison-chart"
import { RevenueTrendChart } from "@/components/reports/charts/revenue-trend-chart"
import { RevenueByCategoryChart } from "@/components/reports/charts/revenue-by-category-chart"
import { RevenueByMonthFilters, RevenueComparisonFilters, RevenueTrendFilters, RevenueByCategoryFilters, RevenueOverviewFilters, RecentTransactionsFilters } from "@/types/report"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRevenueOverview, useRecentTransactions } from "@/hooks/use-report"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar28 } from "../ui/calendar28"
import { formatVND } from "@/lib/utils/currency"

export default function RevenueReports() {

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const getLastDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    const currentDate = new Date();

    const [revenueFilters, setRevenueFilters] = useState<RevenueByMonthFilters>({
        year: new Date().getFullYear(),
        monthsCount: 12
    })
    const [comparisonFilters, setComparisonFilters] = useState<RevenueComparisonFilters>({
        currentYear: new Date().getFullYear(),
        previousYear: new Date().getFullYear() - 1,
        monthsCount: 6
    })
    const [trendFilters, setTrendFilters] = useState<RevenueTrendFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: new Date(),
        weeksCount: 12
    })
    const [categoryFilters, setCategoryFilters] = useState<RevenueByCategoryFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: new Date(),
        topN: 6
    })
    const [overviewFilters, setOverviewFilters] = useState<RevenueOverviewFilters>({
        startDate: getFirstDayOfMonth(currentDate), // Ngày đầu tháng
        endDate: getLastDayOfMonth(currentDate),   // Ngày cuối tháng
    });
    const [transactionFilters, setTransactionFilters] = useState<RecentTransactionsFilters>({
        startDate: getFirstDayOfMonth(currentDate), // Ngày đầu tháng
        endDate: getLastDayOfMonth(currentDate),   // Ngày cuối tháng
        limit: 5
    })

    const { data: overviewDataResult, isLoading: overviewLoading, error: overviewError } = useRevenueOverview(overviewFilters)
    const { data: transactionsDataResult, isLoading: transactionsLoading, error: transactionsError } = useRecentTransactions(transactionFilters)

    const overviewData = overviewDataResult?.data;
    const transactionsData = transactionsDataResult?.data;


    const handleRevenueFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setRevenueFilters(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'monthsCount' ? parseInt(value) : value
        }))
    }

    const handleComparisonFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setComparisonFilters(prev => ({
            ...prev,
            [name]: name === 'currentYear' || name === 'previousYear' || name === 'monthsCount' ? parseInt(value) : value
        }))
    }

    const handleTrendFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTrendFilters(prev => ({
            ...prev,
            [name]: name === 'weeksCount' ? parseInt(value) : value
        }))
    }

    const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCategoryFilters(prev => ({
            ...prev,
            [name]: name === 'topN' ? parseInt(value) : value
        }))
    }


    const handleTransactionFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTransactionFilters(prev => ({
            ...prev,
            [name]: name === 'limit' ? parseInt(value) : value
        }))
    }

    return (
        <Tabs defaultValue="total" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="total">Tổng doanh thu</TabsTrigger>
                <TabsTrigger value="comparison">So sánh doanh thu</TabsTrigger>
                <TabsTrigger value="trend">Xu hướng doanh thu</TabsTrigger>
                <TabsTrigger value="category">Theo danh mục</TabsTrigger>
            </TabsList>
            <TabsContent value="total" className="space-y-4 mt-4">
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
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
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-xl font-bold">
                                        {formatVND(overviewData?.totalRevenue || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.monthGrowthPercentage && overviewData?.monthGrowthPercentage >= 0 ? '+' : ''}
                                        {overviewData?.monthGrowthPercentage}% so với tháng trước
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
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
                                <path d="M16 3v4" />
                                <path d="M8 3v4" />
                                <path d="M4 11h16" />
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M8 16h.01" />
                                <path d="M12 16h.01" />
                                <path d="M16 16h.01" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-xl font-bold">{formatVND(overviewData?.thisMonthRevenue || 0)}</div>

                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.monthGrowthPercentage && overviewData?.monthGrowthPercentage >= 0 ? '+' : ''}{overviewData?.monthGrowthPercentage}% so với tháng trước
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tuần này</CardTitle>
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
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-xl font-bold">{formatVND(overviewData?.thisWeekRevenue || 0)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.weekGrowthPercentage && overviewData?.weekGrowthPercentage >= 0 ? '+' : ''}{overviewData?.weekGrowthPercentage}% so với tuần trước
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
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
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            {overviewLoading ? (
                                <Skeleton className="h-8 w-[100px]" />
                            ) : overviewError ? (
                                <div className="text-red-500">Lỗi tải dữ liệu</div>
                            ) : (
                                <>
                                    <div className="text-xl font-bold">{formatVND(overviewData?.todayRevenue || 0)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {overviewData?.dayGrowthPercentage && overviewData?.dayGrowthPercentage >= 0 ? '+' : ''}{overviewData?.dayGrowthPercentage}% so với hôm qua
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-7">
                        <CardHeader>
                            <CardTitle>Tổng quan Doanh thu</CardTitle>
                            <CardDescription>Doanh thu theo tháng</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="revenue-year" className="text-sm font-medium">
                                        Năm
                                    </Label>
                                    <Input
                                        id="revenue-year"
                                        name="year"
                                        type="number"
                                        onChange={handleRevenueFilterChange}
                                        value={revenueFilters.year}
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="revenue-monthsCount" className="text-sm font-medium">
                                        Số tháng
                                    </Label>
                                    <Input
                                        id="revenue-monthsCount"
                                        name="monthsCount"
                                        type="number"
                                        min="1"
                                        max="12"
                                        onChange={handleRevenueFilterChange}
                                        value={revenueFilters.monthsCount}
                                    />
                                </div>
                            </div>
                            <RevenueChart filters={revenueFilters} />

                        </CardContent>
                    </Card>
                    <Card className="col-span-7">
                        <CardHeader>
                            <CardTitle>Giao dịch gần đây</CardTitle>
                            <CardDescription>
                                {transactionsLoading ? (
                                    <Skeleton className="h-4 w-[100px]" />
                                ) : transactionsError ? (
                                    <div className="text-red-500">Lỗi tải dữ liệu</div>
                                ) : (
                                    `Bạn đã thực hiện ${transactionsData?.length || 0} giao dịch trong tháng này.`
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-2">
                                    <Calendar28
                                        selected={transactionFilters.startDate ?? null}
                                        onSelect={(date) => {
                                            setTransactionFilters(prev => ({
                                                ...prev,
                                                startDate: date ?? undefined
                                            }))
                                        }}
                                        label="Ngày bắt đầu"
                                        id="transaction-startDate"

                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="transaction-limit" className="text-sm font-medium">Số giao dịch</Label>
                                    <Input
                                        id="transaction-limit"
                                        name="limit"
                                        type="number"
                                        min="1"
                                        max="10"
                                        onChange={handleTransactionFilterChange}
                                        value={transactionFilters.limit || 5}
                                    />
                                </div>
                            </div>
                            <div className="space-y-8">
                                {transactionsLoading ? (
                                    [...Array(5)].map((_, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <Skeleton className="h-4 w-[150px]" />
                                                <Skeleton className="h-3 w-[100px]" />
                                            </div>
                                            <Skeleton className="ml-auto h-4 w-[80px]" />
                                        </div>
                                    ))
                                ) : transactionsError ? (
                                    <div className="text-red-500 text-center">Lỗi tải dữ liệu</div>
                                ) : (
                                    transactionsData?.map((transaction, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{transaction.customerName}</p>
                                                <p className="text-sm text-muted-foreground">{transaction.customerEmail}</p>
                                            </div>
                                            <div className="ml-auto font-medium">+{formatVND(transaction.amount)}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="comparison" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>So sánh Doanh thu</CardTitle>
                        <CardDescription>So sánh doanh thu giữa các kỳ hiện tại và trước đó</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="comparison-currentYear">Năm hiện tại</Label>
                                <Input
                                    id="comparison-currentYear"
                                    name="currentYear"
                                    type="number"
                                    onChange={handleComparisonFilterChange}
                                    value={comparisonFilters.currentYear}
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="comparison-previousYear">Năm trước</Label>
                                <Input
                                    id="comparison-previousYear"
                                    name="previousYear"
                                    type="number"
                                    onChange={handleComparisonFilterChange}
                                    value={comparisonFilters.previousYear}
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="comparison-monthsCount">Số tháng</Label>
                                <Input
                                    id="comparison-monthsCount"
                                    name="monthsCount"
                                    type="number"
                                    min="1"
                                    max="12"
                                    onChange={handleComparisonFilterChange}
                                    value={comparisonFilters.monthsCount}
                                />
                            </div>
                        </div>
                        <RevenueComparisonChart filters={comparisonFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="trend" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Xu hướng Doanh thu</CardTitle>
                        <CardDescription>Theo dõi xu hướng doanh thu theo thời gian</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Calendar28
                                    selected={trendFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setTrendFilters(prev => ({
                                            ...prev,
                                            startDate: date || new Date()
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="trend-startDate"

                                />

                            </div>
                            <div className="flex flex-col space-y-2">
                                <Calendar28
                                    selected={trendFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setTrendFilters(prev => ({
                                            ...prev,
                                            endDate: date || new Date()
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="trend-endDate"

                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="trend-weeksCount">Số tuần</Label>
                                <Input
                                    id="trend-weeksCount"
                                    name="weeksCount"
                                    type="number"
                                    min="1"
                                    onChange={handleTrendFilterChange}
                                    value={trendFilters.weeksCount}
                                />
                            </div>
                        </div>
                        <RevenueTrendChart filters={trendFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="category" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu theo Danh mục</CardTitle>
                        <CardDescription>Phân tích doanh thu theo danh mục sản phẩm</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Calendar28
                                    selected={categoryFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setCategoryFilters(prev => ({
                                            ...prev,
                                            startDate: date || new Date()
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="category-startDate"

                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={categoryFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setCategoryFilters(prev => ({
                                            ...prev,
                                            endDate: date || new Date()
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="category-endDate"

                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="category-topN">Số danh mục</Label>
                                <Input
                                    id="category-topN"
                                    name="topN"
                                    type="number"
                                    min="1"
                                    onChange={handleCategoryFilterChange}
                                    value={categoryFilters.topN}
                                />
                            </div>
                        </div>
                        <RevenueByCategoryChart filters={categoryFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}