// components/dashboard/dashboard-reports.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import data from "@/config/data.json"
import { DataTable } from "../data-table"


export const DashboardReports = () => (
    <Card>
        <CardHeader>
            <CardTitle>Báo cáo</CardTitle>
            <CardDescription>Xem và tải xuống báo cáo của cửa hàng.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
            <DataTable data={data} />
        </CardContent>
    </Card>
)