"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TopProductsChart } from "@/components/reports/charts/top-products-chart"
import { ProductReturnRateChart } from "@/components/reports/charts/product-return-rate-chart"
import { ProductsByCategoryChart } from "@/components/reports/charts/products-by-category-chart"
import { TopProductsFilters, ProductReturnRateFilters, ProductsByCategoryFilters, LowStockProductsFilters } from "@/types/report"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLowStockProducts } from "@/hooks/use-report"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar28 } from "../ui/calendar28"
import { SingleSelect } from "../ui/select/single-select"
import { useGetOptionCategories } from "@/hooks/use-categories"

export default function ProductReports() {
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const getLastDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    const currentDate = new Date();


    const [topProductsFilters, setTopProductsFilters] = useState<TopProductsFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: getLastDayOfMonth(currentDate),
        topN: 10,
        orderBy: "Revenue"
    })
    const [returnRateFilters, setReturnRateFilters] = useState<ProductReturnRateFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: getLastDayOfMonth(currentDate),
        topN: 8
    })
    const [categoryFilters, setCategoryFilters] = useState<ProductsByCategoryFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: getLastDayOfMonth(currentDate),
    })
    const [lowStockFilters, setLowStockFilters] = useState<LowStockProductsFilters>({
        minStock: 10
    })
    const { data: categories, isLoading: categoriesLoading } = useGetOptionCategories();


    const { data: lowStockData, isLoading: lowStockLoading, error: lowStockError } = useLowStockProducts(lowStockFilters)

    const handleTopProductsFilterChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            setTopProductsFilters(prev => ({
                ...prev,
                orderBy: e as 'Revenue' | 'Quantity' | 'Orders'
            }))
        } else {
            const { name: inputName, value } = e.target
            setTopProductsFilters(prev => ({
                ...prev,
                [inputName]: inputName === 'topN' || inputName === 'categoryId' ? parseInt(value) : value
            }))
        }
    }

    const handleReturnRateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setReturnRateFilters(prev => ({
            ...prev,
            [name]: name === 'topN' || name === 'categoryId' || name === 'minReturnRate' ? parseFloat(value) : value
        }))
    }

    const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            setCategoryFilters(prev => ({
                ...prev,
                includeInactive: e === 'true'
            }))
        } else {
            const { name, value } = e.target
            setCategoryFilters(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleLowStockFilterChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            setLowStockFilters(prev => ({
                ...prev,
                stockStatus: e as 'Critical' | 'Low' | 'All'
            }))
        } else {
            const { name, value } = e.target
            setLowStockFilters(prev => ({
                ...prev,
                [name]: name === 'minStock' || name === 'categoryId' ? parseInt(value) : value
            }))
        }
    }

    return (
        <Tabs defaultValue="top" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="top">Sản phẩm bán chạy</TabsTrigger>
                <TabsTrigger value="stock">Hàng tồn kho thấp</TabsTrigger>
                <TabsTrigger value="returns">Tỷ lệ trả hàng</TabsTrigger>
                <TabsTrigger value="category">Theo danh mục</TabsTrigger>
            </TabsList>
            <TabsContent value="top" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Sản phẩm Bán chạy nhất</CardTitle>
                        <CardDescription>Sản phẩm có doanh thu cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Calendar28
                                    selected={topProductsFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setTopProductsFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="top-product-startDate"
                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={topProductsFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setTopProductsFilters(prev => ({
                                            ...prev,
                                            endDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="top-product-endDate"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="top-topN">Số lượng sản phẩm</Label>
                                <Input
                                    id="top-topN"
                                    name="topN"
                                    type="number"
                                    min="1"
                                    max="50"
                                    onChange={handleTopProductsFilterChange}
                                    value={topProductsFilters.topN || 10}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="top-orderBy">Sắp xếp theo</Label>
                                <Select onValueChange={(value) => handleTopProductsFilterChange(value)}>
                                    <SelectTrigger id="top-orderBy">
                                        <SelectValue placeholder={"Doanh thu"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Revenue">Doanh thu</SelectItem>
                                        <SelectItem value="Quantity">Số lượng</SelectItem>
                                        <SelectItem value="Orders">Đơn hàng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <TopProductsChart filters={topProductsFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="stock" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Sản phẩm tồn kho thấp</CardTitle>
                        <CardDescription>Sản phẩm cần được nhập hàng sớm</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="stock-minStock">Tồn kho tối thiểu</Label>
                                <Input
                                    id="stock-minStock"
                                    name="minStock"
                                    type="number"
                                    min="1"
                                    onChange={handleLowStockFilterChange}
                                    value={lowStockFilters.minStock || 10}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="stock-categoryId">Danh mục</Label>
                                <SingleSelect
                                    id="stock-categoryId"
                                    options={categories?.data || []}
                                    isLoading={categoriesLoading}
                                    value={lowStockFilters.categoryId || null}
                                    onChange={(value) => {
                                        setLowStockFilters(prev => ({
                                            ...prev,
                                            categoryId: value || undefined
                                        }))
                                    }}
                                    placeholder="Chọn danh mục..."
                                    searchPlaceholder="Tìm kiếm danh mục..."
                                    emptySearchMessage="Không tìm thấy danh mục"
                                    clearable
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="stock-status">Trạng thái</Label>
                                <Select onValueChange={handleLowStockFilterChange}>
                                    <SelectTrigger id="stock-status">
                                        <SelectValue placeholder={lowStockFilters.stockStatus || 'Tất cả'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">Tất cả</SelectItem>
                                        <SelectItem value="Critical">Nguy cấp</SelectItem>
                                        <SelectItem value="Low">Thấp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {lowStockLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton className="h-5 w-5" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[150px]" />
                                                <Skeleton className="h-3 w-[100px]" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-6 w-[60px]" />
                                    </div>
                                ))}
                            </div>
                        ) : lowStockError ? (
                            <div className="flex justify-center items-center h-[200px]">
                                Lỗi khi tải dữ liệu
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lowStockData?.data?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <AlertTriangle className={`h-5 w-5 ${item.currentStock <= 3 ? 'text-red-500' : 'text-amber-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={item.currentStock <= 3 ? 'bg-red-400' : 'bg-amber-400'}>
                                            Còn {item.currentStock}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="returns" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Tỷ lệ trả hàng theo sản phẩm</CardTitle>
                        <CardDescription>Sản phẩm có tỷ lệ trả hàng cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Calendar28
                                    selected={returnRateFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setReturnRateFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="returns-startDate"
                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={returnRateFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setReturnRateFilters(prev => ({
                                            ...prev,
                                            endDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="returns-endDate"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="returns-topN">Số lượng sản phẩm</Label>
                                <Input
                                    id="returns-topN"
                                    name="topN"
                                    type="number"
                                    min="1"
                                    max="50"
                                    onChange={handleReturnRateFilterChange}
                                    value={returnRateFilters.topN || 8}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="returns-minReturnRate">Tỷ lệ trả hàng tối thiểu</Label>
                                <Input
                                    id="returns-minReturnRate"
                                    name="minReturnRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    onChange={handleReturnRateFilterChange}
                                    value={returnRateFilters.minReturnRate || ''}
                                />
                            </div>
                        </div>
                        <ProductReturnRateChart filters={returnRateFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="category" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Sản phẩm theo Danh mục</CardTitle>
                        <CardDescription>Phân bổ sản phẩm theo các danh mục</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Calendar28
                                    selected={categoryFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setCategoryFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? undefined
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
                                            endDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="category-endDate"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="category-includeInactive">Bao gồm không hoạt động</Label>
                                <Select onValueChange={handleCategoryFilterChange}>
                                    <SelectTrigger id="category-includeInactive">
                                        <SelectValue placeholder={categoryFilters.includeInactive ? 'Có' : 'Không'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">Không</SelectItem>
                                        <SelectItem value="true">Có</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <ProductsByCategoryChart filters={categoryFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}