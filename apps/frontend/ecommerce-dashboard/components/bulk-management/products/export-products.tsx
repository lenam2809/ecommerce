// app/products/bulk-management/components/export-products.tsx
"use client";

import { Check, ChevronsUpDown, FileDown, Loader2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useProductExport } from "@/hooks/use-product-export";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ExportProducts() {
    const [fileFormat, setFileFormat] = useState("xlsx");
    const [includeInactive, setIncludeInactive] = useState(false);
    const [exportType, setExportType] = useState("all");
    const [open, setOpen] = useState(false);

    const {
        products,
        isLoadingProducts,
        exportMutation,
        selectedProductIds,
        toggleProductSelection,
    } = useProductExport();

    const handleExport = () => {
        if (exportType === "selected" && selectedProductIds.length === 0) {
            toast({
                title: "Chưa chọn sản phẩm",
                description: "Vui lòng chọn ít nhất một sản phẩm để xuất",
                variant: "destructive",
            });
            return;
        }

        exportMutation.mutate({
            format: fileFormat,
            includeInactive,
            productIds: exportType === "selected" ? selectedProductIds : undefined,
        });
    };

    const isLoading = isLoadingProducts || exportMutation.isPending;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Tùy chọn xuất dữ liệu</CardTitle>
                        <CardDescription>
                            Chọn định dạng và sản phẩm để xuất
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="file-format" className="mb-2 block">Định dạng file</Label>
                                <RadioGroup
                                    id="file-format"
                                    defaultValue="xlsx"
                                    value={fileFormat}
                                    onValueChange={setFileFormat}
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="xlsx" id="xlsx" />
                                        <Label htmlFor="xlsx">Excel (XLSX)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="xls" id="xls" />
                                        <Label htmlFor="xls">Excel (XLS)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="csv" id="csv" />
                                        <Label htmlFor="csv">CSV</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <Label htmlFor="export-type" className="mb-2 block">Sản phẩm cần xuất</Label>
                                <RadioGroup
                                    id="export-type"
                                    defaultValue="all"
                                    value={exportType}
                                    onValueChange={setExportType}
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="all" />
                                        <Label htmlFor="all">Tất cả sản phẩm</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="selected" id="selected" />
                                        <Label htmlFor="selected">Sản phẩm đã chọn</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {exportType === "selected" && (
                                <div>
                                    <Label htmlFor="product-select" className="mb-2 block">Chọn sản phẩm</Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-full justify-between"
                                                disabled={isLoading}
                                            >
                                                {selectedProductIds.length
                                                    ? `Đã chọn ${selectedProductIds.length} sản phẩm`
                                                    : "Chọn sản phẩm..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                                                <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {isLoadingProducts ? (
                                                            <div className="flex items-center justify-center p-4">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            </div>
                                                        ) : (
                                                            products?.map(product => (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.id}
                                                                    onSelect={() => toggleProductSelection(product.id)}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedProductIds.includes(product.id) ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">{product.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {product.code} | {product.sku}
                                                                        </div>
                                                                    </div>
                                                                    {!product.isActive && (
                                                                        <Badge variant="outline" className="ml-2">Ngừng hoạt động</Badge>
                                                                    )}
                                                                </CommandItem>
                                                            ))
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {selectedProductIds.length > 0 && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            Đã chọn {selectedProductIds.length} sản phẩm
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="include-inactive"
                                    checked={includeInactive}
                                    onCheckedChange={setIncludeInactive}
                                    disabled={isLoading}
                                />
                                <Label htmlFor="include-inactive">
                                    Bao gồm sản phẩm ngừng hoạt động
                                </Label>
                            </div>

                            <Button
                                onClick={handleExport}
                                disabled={isLoading || (exportType === "selected" && selectedProductIds.length === 0)}
                                className="w-full"
                            >
                                {exportMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <FileDown className="mr-2 h-4 w-4" />
                                )}
                                Xuất sản phẩm
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin xuất dữ liệu</CardTitle>
                        <CardDescription>
                            Dữ liệu sẽ được bao gồm trong file xuất
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Table2 className="h-10 w-10 text-primary mr-4" />
                                <div>
                                    <h3 className="font-medium">Các trường dữ liệu</h3>
                                    <p className="text-sm text-muted-foreground">
                                        File xuất sẽ bao gồm tất cả dữ liệu sản phẩm bao gồm danh mục, thương hiệu, thông số kỹ thuật, biến thể và nhiều hơn nữa.
                                    </p>
                                </div>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/30">
                                <h4 className="font-medium mb-2">Dữ liệu bao gồm</h4>
                                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <li>• ID sản phẩm</li>
                                    <li>• Mã sản phẩm</li>
                                    <li>• Tên</li>
                                    <li>• SKU</li>
                                    <li>• Giá</li>
                                    <li>• Giá khuyến mãi</li>
                                    <li>• Số lượng tồn kho</li>
                                    <li>• Mô tả</li>
                                    <li>• Ngày đăng</li>
                                    <li>• Trạng thái hoạt động</li>
                                    <li>• Danh mục</li>
                                    <li>• Thương hiệu</li>
                                    <li>• Hình ảnh</li>
                                    <li>• Đánh giá</li>
                                    <li>• Màu sắc</li>
                                    <li>• Kích thước</li>
                                    <li>• Thông số kỹ thuật</li>
                                </ul>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <p>
                                    File xuất này có thể được chỉnh sửa và nhập lại để cập nhật dữ liệu sản phẩm hàng loạt.
                                    Sử dụng cột &quot;Hành động&quot; để chỉ định THÊM, CẬP NHẬT hoặc XÓA sản phẩm.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}