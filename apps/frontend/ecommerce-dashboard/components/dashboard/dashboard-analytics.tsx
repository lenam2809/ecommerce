// components/dashboard/dashboard-analytics.tsx
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { useRevenueData, useCustomersData, useOrdersData, useProductsData } from "@/hooks/use-dashboard"

export const DashboardAnalytics = () => {
    const { data: revenueData } = useRevenueData();
    const { data: customersData } = useCustomersData();
    const { data: ordersData } = useOrdersData();
    const { data: productsData } = useProductsData();

    const revenueChartData = revenueData?.data?.map(item => ({
        date: item.date,
        value: item.revenue
    })) || [];

    const customersChartData = customersData?.data?.map(item => ({
        date: item.date,
        value: item.newUsers
    })) || [];

    const ordersChartData = ordersData?.data?.map(item => ({
        date: item.date,
        value: item.newOrders
    })) || [];

    const productsChartData = productsData?.data?.map(item => ({
        date: item.date,
        value: item.newProducts
    })) || [];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <ChartAreaInteractive
                    title="Doanh thu theo thời gian"
                    description="Biểu đồ doanh thu trong 30 ngày qua"
                    height={400}
                    data={revenueChartData}
                    colors={{
                        desktop: "#ff0000",
                        mobile: "#00ff00"
                    }}
                />
                <ChartAreaInteractive
                    title="Khách hàng theo thời gian"
                    description="Biểu đồ số lượng khách hàng mới trong 30 ngày qua"
                    height={400}
                    data={customersChartData}
                    colors={{
                        desktop: "#ff0000",
                        mobile: "#00ff00"
                    }}
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <ChartAreaInteractive
                    title="Đơn hàng theo thời gian"
                    description="Biểu đồ số lượng đơn hàng trong 30 ngày qua"
                    height={400}
                    data={ordersChartData}
                    colors={{
                        desktop: "#ff0000",
                        mobile: "#00ff00"
                    }}
                />

                <ChartAreaInteractive
                    title="Sản phẩm mới theo thời gian"
                    description="Biểu đồ số lượng sản phẩm mới trong 30 ngày qua"
                    height={400}
                    data={productsChartData}
                    colors={{
                        desktop: "#ff0000",
                        mobile: "#00ff00"
                    }}
                />
            </div>
        </>
    )
}