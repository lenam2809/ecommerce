import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ShoppingCart } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTopProductsData } from "@/hooks/use-dashboard"

export function TopProducts() {
    const { data, isLoading } = useTopProductsData()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 5 sản phẩm bán chạy</CardTitle>
                <CardDescription>Sản phẩm có số lượng bán cao nhất</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.data} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis
                                        dataKey="productName"
                                        type="category"
                                        width={120}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value} sản phẩm`, "Đã bán"]}
                                        labelFormatter={(label) => `${label}`}
                                    />
                                    <Bar dataKey="quantitySold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-2">
                            {data?.data?.map((product) => (
                                <div key={product.productId} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ShoppingCart className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{product.productName}</span>
                                    </div>
                                    <div className="font-semibold">{product.quantitySold} sản phẩm</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
