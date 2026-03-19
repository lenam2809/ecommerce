// components/dashboard/dashboard-overview.tsx
import { KpiCards } from "./kpi-cards";
import { RevenueChart } from "./revenue-chart";
import { TopProducts } from "./top-products";
import { CustomersTable } from "./customers-table";


export const DashboardOverview = () => (
    <>
        <KpiCards />
        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
                <RevenueChart />
            </div>
            <div className="col-span-3">
                <TopProducts />
            </div>
        </div>
        <CustomersTable />

    </>
)