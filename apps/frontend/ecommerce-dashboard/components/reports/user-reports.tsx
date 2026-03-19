"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    TopUsersFilters,
    UserActivityFilters,
    UserSegmentationFilters
} from "@/types/report"
import { TopUsersChart } from "./charts/top-users-chart"
import { UserActivityChart } from "./charts/user-activity-chart"
import { UserSegmentationChart } from "./charts/user-segmentation-chart"
import { Calendar28 } from "../ui/calendar28"

export default function UserReports() {
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const getLastDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    const currentDate = new Date();

    const [topUsersFilters, setTopUsersFilters] = useState<TopUsersFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: getLastDayOfMonth(currentDate),
        topN: 10,
        orderBy: "TotalSpent"
    })
    const [activityFilters, setActivityFilters] = useState<UserActivityFilters>({
        days: 30
    })
    const [segmentationFilters, setSegmentationFilters] = useState<UserSegmentationFilters>({
        startDate: getFirstDayOfMonth(currentDate),
        endDate: getLastDayOfMonth(currentDate),
    })

    const handleTopUsersFilterChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            setTopUsersFilters(prev => ({
                ...prev,
                orderBy: e as 'TotalSpent' | 'OrderCount' | 'LastActivity'
            }))
        } else {
            const { name: inputName, value } = e.target
            setTopUsersFilters(prev => ({
                ...prev,
                [inputName]: inputName === 'topN' ? parseInt(value) : value
            }))
        }
    }

    const handleActivityFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setActivityFilters(prev => ({
            ...prev,
            [name]: name === 'days' ? parseInt(value) : value
        }))
    }

    const handleSegmentationFilterChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            setSegmentationFilters(prev => ({
                ...prev,
                includeInactive: e === 'true'
            }))
        } else {
            const { name, value } = e.target
            setSegmentationFilters(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    return (
        <Tabs defaultValue="top" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="top">Người dùng hàng đầu</TabsTrigger>
                <TabsTrigger value="activity">Hoạt động người dùng</TabsTrigger>
                <TabsTrigger value="segmentation">Phân khúc người dùng</TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Người dùng</CardTitle>
                        <CardDescription>Người dùng có giá trị cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Calendar28
                                    selected={topUsersFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setTopUsersFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="top-users-startDate"

                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={topUsersFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setTopUsersFilters(prev => ({
                                            ...prev,
                                            endDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="top-users-endDate"

                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="top-orderBy">Sắp xếp theo</Label>
                                <Select onValueChange={(value) => handleTopUsersFilterChange(value)}>
                                    <SelectTrigger id="top-orderBy">
                                        <SelectValue placeholder={"Tổng chi tiêu"} defaultValue={"TotalSpent"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TotalSpent">Tổng chi tiêu</SelectItem>
                                        <SelectItem value="OrderCount">Số đơn hàng</SelectItem>
                                        <SelectItem value="LastActivity">Hoạt động gần nhất</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <TopUsersChart filters={topUsersFilters} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Hoạt động người dùng</CardTitle>
                        <CardDescription>Hoạt động của người dùng theo thời gian</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="activity-days">Số ngày</Label>
                                <Input
                                    id="activity-days"
                                    name="days"
                                    type="number"
                                    min="1"
                                    max="365"
                                    onChange={handleActivityFilterChange}
                                    value={activityFilters.days || 30}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="activity-type">Loại hoạt động</Label>
                                <Select onValueChange={(value) => setActivityFilters(prev => ({ ...prev, activityType: value as 'All' | 'Purchases' | 'Logins' | 'PageViews' }))}>
                                    <SelectTrigger id="activity-type">
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">Tất cả</SelectItem>
                                        <SelectItem value="Purchases">Mua hàng</SelectItem>
                                        <SelectItem value="Logins">Đăng nhập</SelectItem>
                                        <SelectItem value="PageViews">Xem trang</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <UserActivityChart filters={activityFilters} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="segmentation" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Phân khúc người dùng</CardTitle>
                        <CardDescription>Phân bổ người dùng theo các phân khúc</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Calendar28
                                    selected={segmentationFilters.startDate ?? null}
                                    onSelect={(date) => {
                                        setSegmentationFilters(prev => ({
                                            ...prev,
                                            startDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày bắt đầu"
                                    id="top-users-startDate"

                                />
                            </div>
                            <div>
                                <Calendar28
                                    selected={segmentationFilters.endDate ?? null}
                                    onSelect={(date) => {
                                        setSegmentationFilters(prev => ({
                                            ...prev,
                                            endDate: date ?? undefined
                                        }))
                                    }}
                                    label="Ngày kết thúc"
                                    id="top-users-endDate"

                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="segmentation-includeInactive">Bao gồm không hoạt động</Label>
                                <Select onValueChange={handleSegmentationFilterChange}>
                                    <SelectTrigger id="segmentation-includeInactive">
                                        <SelectValue placeholder={segmentationFilters.includeInactive ? 'Có' : 'Không'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">Không</SelectItem>
                                        <SelectItem value="true">Có</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <UserSegmentationChart filters={segmentationFilters} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}