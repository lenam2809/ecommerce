"use client"

import { useState, useMemo } from "react"
import { useGetProductAddOns } from "@/hooks/use-product-addons"
import { ProductAddOn, ProductAddOnType } from "@/types/product-addon"
import { ProductAddOnTable } from "@/components/product-addons/product-addon-table"
import { ProductAddOnDialog } from "@/components/product-addons/product-addon-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, SearchIcon, ShieldCheckIcon, RefreshCwIcon } from "lucide-react"

export default function ProductAddOnsPage() {
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddon, setEditingAddon] = useState<ProductAddOn | null>(null)

  const { data: result, isLoading, refetch, isRefetching } = useGetProductAddOns()

  const allAddons: ProductAddOn[] = result?.data || []

  // Client-side filtering
  const filteredAddons = useMemo(() => {
    return allAddons.filter((item: ProductAddOn) => {
      const matchSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())

      const matchType = selectedType === "all" || item.addOnType === selectedType

      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && item.isActive) ||
        (selectedStatus === "inactive" && !item.isActive)

      return matchSearch && matchType && matchStatus
    })
  }, [allAddons, search, selectedType, selectedStatus])

  const handleOpenCreate = () => {
    setEditingAddon(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (addon: ProductAddOn) => {
    setEditingAddon(addon)
    setDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tech-blue/10 text-tech-blue">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Kho gói dịch vụ & Bảo hành mua kèm
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Quản lý các gói AppleCare+, bảo hành mở rộng 12T/24T, phụ kiện combo và dịch vụ kỹ thuật áp dụng cho sản phẩm ShopViet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="border-line"
          >
            <RefreshCwIcon className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-brand text-white hover:bg-brand/90 font-medium shadow-sm"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Thêm gói dịch vụ mới
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-card p-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc mã gói (vd: APPLECARE)..."
            className="pl-9 text-xs bg-background border-line"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-[180px]">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="text-xs bg-background border-line">
              <SelectValue placeholder="Phân loại dịch vụ" />
            </SelectTrigger>
            <SelectContent className="bg-card border-line">
              <SelectItem value="all">Tất cả phân loại</SelectItem>
              <SelectItem value="ExtendedWarranty">Bảo hành mở rộng</SelectItem>
              <SelectItem value="AccessoryBundle">Gói phụ kiện</SelectItem>
              <SelectItem value="Installation">Lắp đặt & Dịch vụ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[150px]">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="text-xs bg-background border-line">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-card border-line">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Tạm dừng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <ProductAddOnTable
        addons={filteredAddons}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
      />

      {/* Create / Edit Dialog */}
      <ProductAddOnDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addon={editingAddon}
      />
    </div>
  )
}
