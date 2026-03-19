// components/dashboard/dashboard-analytics.tsx
"use client"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { useProductsData } from "@/hooks/use-dashboard"

function DemoChartComponent() {
    const { data: productsData } = useProductsData();

    console.log("productsData", productsData);
    const productsChartData = productsData?.data?.map(item => ({
        date: item.date,
        value: item.newProducts
    })) || [];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <ChartAreaInteractive
                    title="Sản phẩm mới theo thời gian"
                    description="Biểu đồ số lượng sản phẩm mới trong 30 ngày qua"
                    data={productsChartData}
                    height={400}
                    colors={{
                        desktop: "#ff0000",
                        mobile: "#00ff00"
                    }}
                />
            </div>
        </>
    )
}

export default function DemoChartPage() {
    return (
        <main className="container py-10">
            <h1 className="text-3xl font-bold mb-8 text-center">Date Input Components</h1>
            <DemoChartComponent />
        </main>
    )
}