import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { formatCompactNumber, formatDate, formatVND } from "@/lib/utils/currency"
import { useRevenueData } from "@/hooks/use-dashboard"

export function RevenueChart() {
    const { data, isLoading } = useRevenueData()

    // Prepare data for revenue chart
    const formattedData = data?.data?.map((item) => ({
        date: formatDate(item.date),
        revenue: item.revenue,
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <Skeleton className="h-[250px] w-full" />
                    </div>
                ) : (
                    <ChartContainer
                        config={{
                            revenue: {
                                label: "Doanh thu",
                                color: "hsl(var(--chart-1))",
                            },
                        }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickMargin={10} tickFormatter={(value) => value} />
                                <YAxis tickFormatter={(value) => formatCompactNumber(value)} />
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">Ngày</span>
                                                            <span className="font-bold">{payload[0].payload.date}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">Doanh thu</span>
                                                            <span className="font-bold">{formatVND(payload[0].value as number)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-revenue)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
