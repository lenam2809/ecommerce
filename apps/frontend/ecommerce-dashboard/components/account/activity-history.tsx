"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { useGetActivitiesByUser } from "@/hooks/use-user-activities"
import { User } from "@/types/user"

interface ActivityHistoryProps {
  initialData?: User
}

export default function ActivityHistory({ initialData }: ActivityHistoryProps) {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const activityType = ""
  const [sortBy] = useState("timestamp")
  const [isDescending] = useState(true)

  const userId = initialData?.id || ""
  const {
    data: activitiesData,
    isLoading,
    error,
  } = useGetActivitiesByUser(userId, {
    pageNumber,
    pageSize,
    searchTerm: searchTerm || undefined,
    activityType: activityType || undefined,
    sortBy,
    isDescending,
  })

  const totalPages =
    activitiesData && activitiesData?.data ? Math.ceil(activitiesData.data.totalCount / pageSize) : 0

  const items = activitiesData?.data?.items || []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Lịch sử hoạt động</CardTitle>
            <CardDescription>Xem hoạt động tài khoản gần đây và các sự kiện bảo mật.</CardDescription>
          </div>
          <div>
            <Select value={searchTerm} onValueChange={setSearchTerm}>
              <SelectTrigger className="w-[200px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Lọc hoạt động</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả hoạt động</SelectItem>
                <SelectItem value="login">Đăng nhập</SelectItem>
                <SelectItem value="password changed">Thay đổi mật khẩu</SelectItem>
                <SelectItem value="profile updated">Cập nhật thông tin cá nhân</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Hoạt động</TableHead>
              <TableHead className="hidden w-[120px] truncate md:table-cell">Ghi chú</TableHead>
              <TableHead className="hidden w-[200px] md:table-cell">Vị trí</TableHead>
              <TableHead className="w-[180px]">Ngày &amp; giờ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="font-medium">{activity.activityType}</div>
                </TableCell>
                <TableCell className="hidden max-w-[120px] overflow-hidden whitespace-nowrap truncate md:table-cell">
                  {activity.description}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    {activity.location}
                    <span className="ml-2 text-xs text-muted-foreground">({activity.ipAddress})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>{new Date(activity.timestamp).toLocaleDateString("vi-VN")}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString("vi-VN")}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && !error && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Chưa có hoạt động nào gần đây.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>
            <div className="text-sm text-muted-foreground">
              Trang {pageNumber} trên tổng số {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang sau</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
