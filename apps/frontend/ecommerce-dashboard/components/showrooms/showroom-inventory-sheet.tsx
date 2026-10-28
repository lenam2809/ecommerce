"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Showroom, ShowroomInventoryItem } from "@/types/showroom";
import {
    useGetShowroomInventory,
    useUpdateShowroomInventory,
    useTransferStock,
} from "@/hooks/use-showrooms";
import {
    Boxes,
    ArrowRightLeft,
    Search,
    Loader2,
    Truck,
    Check,
    Store,
    Phone,
    MapPin,
} from "lucide-react";

interface ShowroomInventorySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    showroom: Showroom | null;
    allShowrooms: Showroom[];
}

export function ShowroomInventorySheet({
    open,
    onOpenChange,
    showroom,
    allShowrooms,
}: ShowroomInventorySheetProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingQuantity, setEditingQuantity] = useState<{ [productId: string]: number }>({});
    const [activeTab, setActiveTab] = useState("inventory");

    // Stock transfer form state
    const [transferSkuId, setTransferSkuId] = useState<string>("");
    const [transferTargetShowroomId, setTransferTargetShowroomId] = useState<string>("");
    const [transferQuantity, setTransferQuantity] = useState<number>(1);
    const [transferNote, setTransferNote] = useState<string>("");

    const showroomId = showroom?.id ?? "";

    const { data: inventoryResult, isLoading: isInventoryLoading } = useGetShowroomInventory(
        showroomId,
        searchQuery
    );

    const updateInventoryMutation = useUpdateShowroomInventory(showroomId);
    const transferStockMutation = useTransferStock(showroomId, () => {
        // Reset transfer form
        setTransferSkuId("");
        setTransferTargetShowroomId("");
        setTransferQuantity(1);
        setTransferNote("");
        setActiveTab("inventory");
    });

    const inventoryItems = inventoryResult?.data ?? [];

    const otherShowrooms = allShowrooms.filter(
        (s) => s.id !== showroomId && s.isActive
    );

    const selectedTransferItem = inventoryItems.find(
        (item) => item.productId === transferSkuId
    );

    const handleQuantityChange = (productId: string, val: number) => {
        setEditingQuantity((prev) => ({ ...prev, [productId]: val }));
    };

    const handleSaveQuantity = (item: ShowroomInventoryItem) => {
        const newQty = editingQuantity[item.productId] ?? item.quantity;
        updateInventoryMutation.mutate({
            showroomId,
            productId: item.productId,
            productVariantSkuId: item.productVariantSkuId,
            quantity: newQty,
            reservedQuantity: item.reservedQuantity,
            isAvailableFor2hDelivery: item.isAvailableFor2hDelivery,
        });
    };

    const handleToggle2hDelivery = (item: ShowroomInventoryItem, checked: boolean) => {
        updateInventoryMutation.mutate({
            showroomId,
            productId: item.productId,
            productVariantSkuId: item.productVariantSkuId,
            quantity: editingQuantity[item.productId] ?? item.quantity,
            reservedQuantity: item.reservedQuantity,
            isAvailableFor2hDelivery: checked,
        });
    };

    const handleExecuteTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransferItem || !transferTargetShowroomId) return;

        transferStockMutation.mutate({
            fromShowroomId: showroomId,
            toShowroomId: transferTargetShowroomId,
            productId: selectedTransferItem.productId,
            productVariantSkuId: selectedTransferItem.productVariantSkuId,
            quantity: transferQuantity,
            note: transferNote || "Lệnh điều chuyển tồn kho O2O",
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(val);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-3xl overflow-y-auto w-full p-6 flex flex-col gap-5">
                <SheetHeader className="p-0 border-b pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                    {showroom?.code}
                                </Badge>
                                {showroom?.isFlagship && (
                                    <Badge className="bg-brand text-white text-xs">
                                        Flagship O2O
                                    </Badge>
                                )}
                                {showroom?.hasInstantPickup && (
                                    <Badge className="bg-tech-blue text-white text-xs">
                                        Pickup 15p
                                    </Badge>
                                )}
                            </div>
                            <SheetTitle className="text-xl font-bold mt-1 text-foreground">
                                {showroom?.name}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground flex flex-col gap-1 mt-1">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                    {showroom?.address}, {showroom?.city}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Phone className="size-3.5 text-muted-foreground shrink-0" />
                                    Hotline: <strong className="text-foreground">{showroom?.phone || "1800 6868"}</strong>
                                    {" • "}Giờ mở cửa: {showroom?.openingHours || "08:00 - 21:30"}
                                </span>
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-2 w-full max-w-md">
                        <TabsTrigger value="inventory" className="flex items-center gap-2">
                            <Boxes className="size-4" />
                            <span>Tồn kho tại cơ sở</span>
                            <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 font-mono">
                                {inventoryItems.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="transfer" className="flex items-center gap-2">
                            <ArrowRightLeft className="size-4" />
                            <span>Điều chuyển kho O2O</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: TỒN KHO TẠI CƠ SỞ */}
                    <TabsContent value="inventory" className="flex-1 flex flex-col gap-4 mt-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm theo tên sản phẩm, mã SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {isInventoryLoading ? (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
                                <Loader2 className="size-6 animate-spin text-tech-blue" />
                                <span className="text-sm">Đang tải dữ liệu tồn kho O2O...</span>
                            </div>
                        ) : inventoryItems.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                <Store className="size-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">Không tìm thấy sản phẩm nào</p>
                                <p className="text-xs mt-1">Thử đổi từ khóa tìm kiếm hoặc kiểm tra danh mục sản phẩm.</p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="w-[45%]">Sản phẩm / Mã SKU</TableHead>
                                            <TableHead className="text-right">Giá bán</TableHead>
                                            <TableHead className="text-center w-[130px]">Tồn kho</TableHead>
                                            <TableHead className="text-center">Giữ chỗ</TableHead>
                                            <TableHead className="text-center">Giao 2H</TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventoryItems.map((item) => {
                                            const currentQty =
                                                editingQuantity[item.productId] !== undefined
                                                    ? editingQuantity[item.productId]
                                                    : item.quantity;
                                            const isDirty =
                                                editingQuantity[item.productId] !== undefined &&
                                                editingQuantity[item.productId] !== item.quantity;

                                            return (
                                                <TableRow key={item.productId} className="hover:bg-muted/30">
                                                    <TableCell className="align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-11 rounded-md border border-border bg-card shrink-0 overflow-hidden relative flex items-center justify-center">
                                                                {item.productImage ? (
                                                                    <Image
                                                                        src={item.productImage}
                                                                        alt={item.productName}
                                                                        fill
                                                                        sizes="44px"
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <Boxes className="size-5 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-xs text-foreground truncate max-w-[240px]">
                                                                    {item.productName}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="font-mono text-[11px] text-muted-foreground">
                                                                        {item.skuCode}
                                                                    </span>
                                                                    {item.variantInfo && item.variantInfo !== "Tiêu chuẩn / Mặc định" && (
                                                                        <Badge variant="outline" className="text-[10px] py-0 px-1">
                                                                            {item.variantInfo}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-right align-middle">
                                                        <span className="price-tag font-mono tabular-nums whitespace-nowrap text-xs font-semibold text-brand">
                                                            {formatCurrency(item.price)}
                                                        </span>
                                                    </TableCell>

                                                    <TableCell className="text-center align-middle">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={currentQty}
                                                                onChange={(e) =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        parseInt(e.target.value) || 0
                                                                    )
                                                                }
                                                                className="w-16 h-8 text-center font-mono text-xs"
                                                            />
                                                            {isDirty && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="size-8 text-tech-blue hover:bg-tech-blue/10"
                                                                    onClick={() => handleSaveQuantity(item)}
                                                                    disabled={updateInventoryMutation.isPending}
                                                                >
                                                                    <Check className="size-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-center align-middle">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`font-mono text-xs ${
                                                                item.reservedQuantity > 0
                                                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {item.reservedQuantity}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="text-center align-middle">
                                                        <div className="flex items-center justify-center">
                                                            <Switch
                                                                checked={item.isAvailableFor2hDelivery}
                                                                onCheckedChange={(checked) =>
                                                                    handleToggle2hDelivery(item, checked)
                                                                }
                                                                disabled={updateInventoryMutation.isPending}
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-right align-middle">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-xs text-tech-blue hover:bg-tech-blue/10 h-7 px-2"
                                                            onClick={() => {
                                                                setTransferSkuId(item.productId);
                                                                setActiveTab("transfer");
                                                            }}
                                                        >
                                                            <ArrowRightLeft className="size-3 mr-1" />
                                                            Chuyển
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2: ĐIỀU CHUYỂN KHO O2O */}
                    <TabsContent value="transfer" className="mt-4">
                        <form onSubmit={handleExecuteTransfer} className="space-y-4 max-w-xl mx-auto py-2">
                            <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b">
                                    <span>Cơ sở xuất hàng (Nguồn):</span>
                                    <strong className="text-foreground font-semibold">
                                        {showroom?.name} ({showroom?.code})
                                    </strong>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Sản phẩm điều chuyển *</Label>
                                    <Select value={transferSkuId} onValueChange={setTransferSkuId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn sản phẩm trong kho cơ sở..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[280px]">
                                            {inventoryItems
                                                .filter((i) => i.availableQuantity > 0)
                                                .map((item) => (
                                                    <SelectItem key={item.productId} value={item.productId}>
                                                        {item.productName} ({item.skuCode}) — Tồn khả dụng: {item.availableQuantity}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {inventoryItems.filter((i) => i.availableQuantity > 0).length === 0 && (
                                        <p className="text-xs text-amber-600">
                                            Hiện tại cơ sở này không có mặt hàng nào có tồn kho khả dụng để điều chuyển.
                                        </p>
                                    )}
                                </div>

                                {selectedTransferItem && (
                                    <div className="rounded-md bg-card p-3 border border-border flex items-center justify-between text-xs">
                                        <div className="space-y-0.5">
                                            <p className="font-medium text-foreground">{selectedTransferItem.productName}</p>
                                            <p className="font-mono text-muted-foreground text-[11px]">
                                                SKU: {selectedTransferItem.skuCode}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-muted-foreground">Tồn khả dụng:</p>
                                            <p className="font-mono text-base font-bold text-tech-blue">
                                                {selectedTransferItem.availableQuantity}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Showroom tiếp nhận (Đích) *</Label>
                                    <Select
                                        value={transferTargetShowroomId}
                                        onValueChange={setTransferTargetShowroomId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn showroom nhận hàng..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[280px]">
                                            {otherShowrooms.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.name} ({s.code}) — {s.city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Số lượng điều chuyển *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={selectedTransferItem ? selectedTransferItem.availableQuantity : 1}
                                        value={transferQuantity}
                                        onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 1)}
                                        className="font-mono text-sm"
                                    />
                                    {selectedTransferItem && transferQuantity > selectedTransferItem.availableQuantity && (
                                        <p className="text-xs text-destructive">
                                            Số lượng điều chuyển vượt quá tồn khả dụng ({selectedTransferItem.availableQuantity}).
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Ghi chú điều chuyển / Mã phiếu kho</Label>
                                    <Input
                                        placeholder="VD: Điều chuyển tăng cường Flagship Lê Lợi mở bán..."
                                        value={transferNote}
                                        onChange={(e) => setTransferNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("inventory")}
                                >
                                    Quay lại
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        !selectedTransferItem ||
                                        !transferTargetShowroomId ||
                                        transferQuantity <= 0 ||
                                        transferQuantity > (selectedTransferItem?.availableQuantity ?? 0) ||
                                        transferStockMutation.isPending
                                    }
                                    className="bg-brand hover:bg-brand/90 text-white font-medium"
                                >
                                    {transferStockMutation.isPending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin mr-2" />
                                            Đang điều chuyển...
                                        </>
                                    ) : (
                                        <>
                                            <Truck className="size-4 mr-2" />
                                            Xác nhận điều chuyển kho
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
