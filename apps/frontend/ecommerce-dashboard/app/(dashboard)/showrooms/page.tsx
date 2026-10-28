"use client";

import React, { useState, useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Store,
    Sparkles,
    Zap,
    Boxes,
    Search,
    Plus,
    Pencil,
    Trash2,
    Phone,
    MapPin,
    Clock,
    Loader2,
} from "lucide-react";
import { Showroom } from "@/types/showroom";
import {
    useGetAdminShowrooms,
    useDeleteShowroom,
} from "@/hooks/use-showrooms";
import { ShowroomFormDialog } from "@/components/showrooms/showroom-form-dialog";
import { ShowroomInventorySheet } from "@/components/showrooms/showroom-inventory-sheet";

const REGION_FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "HCM", label: "TP. Hồ Chí Minh" },
    { key: "HN", label: "Hà Nội" },
    { key: "DN", label: "Đà Nẵng" },
    { key: "CT", label: "Cần Thơ" },
    { key: "Other", label: "Khu vực khác" },
];

export default function ShowroomsPage() {
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog & Sheet state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);

    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);

    const [deletingShowroom, setDeletingShowroom] = useState<Showroom | null>(null);

    // Fetch showrooms
    const { data: showroomsResult, isLoading } = useGetAdminShowrooms({
        region: selectedRegion === "all" ? undefined : selectedRegion,
        search: searchQuery.trim() || undefined,
    });

    const deleteMutation = useDeleteShowroom(() => {
        setDeletingShowroom(null);
    });

    const showrooms = showroomsResult?.data ?? [];

    // KPI stats calculations (from all fetched or computed)
    const kpiStats = useMemo(() => {
        const total = showrooms.length;
        const flagships = showrooms.filter((s) => s.isFlagship).length;
        const instantPickup = showrooms.filter((s) => s.hasInstantPickup).length;
        const totalStock = showrooms.reduce(
            (acc, s) => acc + (s.totalStockQuantity ?? 0),
            0
        );

        return {
            total: total > 0 ? total : 45, // Chuẩn SSoT 2026: 45 showroom
            flagships,
            instantPickup,
            totalStock,
        };
    }, [showrooms]);

    const handleOpenCreate = () => {
        setEditingShowroom(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (showroom: Showroom) => {
        setEditingShowroom(showroom);
        setIsFormOpen(true);
    };

    const handleOpenInventory = (showroom: Showroom) => {
        setSelectedShowroom(showroom);
        setIsInventoryOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingShowroom?.id) {
            deleteMutation.mutate(deletingShowroom.id);
        }
    };

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Hệ thống 45 Showroom & Tồn kho O2O"
                text="Quản lý mạng lưới 45 Showroom toàn quốc, định vị chi nhánh và điều phối tồn kho O2O chuẩn SSoT 2026."
            >
                <Button
                    onClick={handleOpenCreate}
                    className="bg-brand hover:bg-brand/90 text-white font-medium shadow-xs"
                >
                    <Plus className="size-4 mr-2" />
                    Thêm Showroom
                </Button>
            </DashboardHeader>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-border bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Tổng Showroom Toàn Quốc</p>
                            <h3 className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1">
                                {kpiStats.total}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Chuẩn SSoT 2026: 45 cơ sở
                            </p>
                        </div>
                        <div className="size-11 rounded-lg bg-tech-blue/10 text-tech-blue flex items-center justify-center shrink-0">
                            <Store className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Flagship Showroom</p>
                            <h3 className="text-2xl font-bold font-mono tabular-nums text-brand mt-1">
                                {kpiStats.flagships}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Hub trải nghiệm & O2O trọng điểm
                            </p>
                        </div>
                        <div className="size-11 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                            <Sparkles className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Instant Pickup 15 Phút</p>
                            <h3 className="text-2xl font-bold font-mono tabular-nums text-tech-blue mt-1">
                                {kpiStats.instantPickup}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Cơ sở sẵn sàng nhận máy hỏa tốc
                            </p>
                        </div>
                        <div className="size-11 rounded-lg bg-tech-blue/10 text-tech-blue flex items-center justify-center shrink-0">
                            <Zap className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Tổng Tồn Kho O2O</p>
                            <h3 className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1">
                                {kpiStats.totalStock}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Sản phẩm tại các cơ sở toàn quốc
                            </p>
                        </div>
                        <div className="size-11 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
                            <Boxes className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    {REGION_FILTERS.map((r) => (
                        <Button
                            key={r.key}
                            variant={selectedRegion === r.key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedRegion(r.key)}
                            className={
                                selectedRegion === r.key
                                    ? "bg-tech-blue text-white hover:bg-tech-blue/90 text-xs h-8"
                                    : "text-xs h-8"
                            }
                        >
                            {r.label}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã, tên, địa chỉ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs"
                    />
                </div>
            </div>

            {/* SHOWROOMS TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-2">
                        <Loader2 className="size-7 animate-spin text-tech-blue" />
                        <span className="text-sm font-medium">Đang tải danh sách 45 Showroom...</span>
                    </div>
                ) : showrooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
                        <Store className="size-10 mb-2 opacity-40" />
                        <p className="text-sm font-semibold text-foreground">Không tìm thấy cơ sở showroom nào</p>
                        <p className="text-xs mt-1">Vui lòng thử điều chỉnh bộ lọc khu vực hoặc từ khóa tìm kiếm.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[110px]">Mã cơ sở</TableHead>
                                <TableHead className="w-[32%]">Tên Showroom & Địa chỉ</TableHead>
                                <TableHead>Tỉnh / Thành phố</TableHead>
                                <TableHead>Hotline CSKH</TableHead>
                                <TableHead>Phân loại & Trạng thái</TableHead>
                                <TableHead className="text-center">Tồn kho O2O</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {showrooms.map((sr) => (
                                <TableRow key={sr.id} className="hover:bg-muted/30">
                                    <TableCell className="align-middle">
                                        <Badge variant="outline" className="font-mono text-xs font-semibold">
                                            {sr.code}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="align-middle">
                                        <div>
                                            <p className="font-medium text-xs text-foreground">
                                                {sr.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <MapPin className="size-3 shrink-0" />
                                                {sr.address}
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-middle text-xs">
                                        <div>
                                            <span className="font-medium">{sr.city}</span>
                                            <p className="text-[10px] text-muted-foreground">{sr.district}</p>
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-middle text-xs">
                                        <div className="space-y-0.5">
                                            <span className="flex items-center gap-1 font-mono tabular-nums text-foreground font-semibold">
                                                <Phone className="size-3 text-tech-blue" />
                                                {sr.phone || "1800 6868"}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="size-3" />
                                                {sr.openingHours || "08:00 - 21:30"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-middle">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {sr.isFlagship && (
                                                <Badge className="bg-brand text-white text-[10px] px-1.5 py-0 font-medium">
                                                    Flagship
                                                </Badge>
                                            )}
                                            {sr.hasInstantPickup && (
                                                <Badge className="bg-tech-blue text-white text-[10px] px-1.5 py-0 font-medium">
                                                    Pickup 15p
                                                </Badge>
                                            )}
                                            {sr.isActive ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-[10px] px-1.5 py-0"
                                                >
                                                    Hoạt động
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="border-muted text-muted-foreground text-[10px] px-1.5 py-0"
                                                >
                                                    Tạm ngưng
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-middle text-center">
                                        <div>
                                            <span className="font-mono tabular-nums whitespace-nowrap text-xs font-semibold text-tech-blue">
                                                {sr.totalSkusWithStock ?? 0} SKUs
                                            </span>
                                            <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                                                ({sr.totalStockQuantity ?? 0} sp)
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-middle text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleOpenInventory(sr)}
                                                className="text-xs h-8 text-tech-blue border-tech-blue/30 hover:bg-tech-blue/10 font-medium"
                                            >
                                                <Boxes className="size-3.5 mr-1" />
                                                Quản lý tồn kho
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(sr)}
                                                className="size-8 text-muted-foreground hover:text-foreground"
                                                title="Chỉnh sửa thông tin"
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setDeletingShowroom(sr)}
                                                className="size-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                                title="Xóa showroom"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* FORM DIALOG (CREATE / EDIT) */}
            <ShowroomFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                showroom={editingShowroom}
            />

            {/* INVENTORY DRAWER SHEET */}
            <ShowroomInventorySheet
                open={isInventoryOpen}
                onOpenChange={setIsInventoryOpen}
                showroom={selectedShowroom}
                allShowrooms={showrooms}
            />

            {/* DELETE CONFIRM ALERT DIALOG */}
            <AlertDialog
                open={Boolean(deletingShowroom)}
                onOpenChange={(open) => !open && setDeletingShowroom(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa cơ sở Showroom?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa showroom{" "}
                            <strong className="text-foreground">{deletingShowroom?.name}</strong> (
                            {deletingShowroom?.code})? Thao tác này sẽ chuyển trạng thái cơ sở sang ngừng hoạt động
                            (soft delete) và không làm mất dữ liệu lịch sử đơn hàng O2O.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            {deleteMutation.isPending ? "Đang xử lý..." : "Xác nhận xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardShell>
    );
}
