// app/products/bulk-management/components/import-products.tsx
"use client";

import { ArrowUpFromLine, FileCheck, FileWarning, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProductImport } from "@/hooks/use-product-import";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function ImportProducts() {
    const [file, setFile] = useState<File | null>(null);
    const [validateOnly, setValidateOnly] = useState(true);
    const [importResult, setImportResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const { importMutation, templateMutation } = useProductImport();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validExtensions = [".xlsx", ".xls", ".csv"];
            const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

            if (validExtensions.includes(fileExtension)) {
                setFile(selectedFile);
                setImportResult(null);
            } else {
                toast({
                    title: "File không hợp lệ",
                    description: "Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV",
                    variant: "destructive",
                });
                e.target.value = "";
            }
        }
    };

    const handleImport = () => {
        if (!file) {
            toast({
                title: "Chưa chọn file",
                description: "Vui lòng chọn file để import",
                variant: "destructive",
            });
            return;
        }
        importMutation.mutate(
            { file, validateOnly },
            {
                onSuccess: (data) => {
                    if (data) setImportResult(data.data);
                },
            }
        );
    };

    const downloadTemplate = (format: string) => {
        templateMutation.mutate(format);
    };

    const isLoading = importMutation.isPending || templateMutation.isPending;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="file-upload">Tải lên file sản phẩm</Label>
                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    {file ? (
                                        <div className="flex items-center justify-center">
                                            <FileCheck className="h-8 w-8 text-green-500 mr-2" />
                                            <div>
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(file.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="h-8 w-8 mx-auto text-gray-500" />
                                            <p className="mt-1 text-sm font-medium">
                                                Kéo thả hoặc click để tải lên
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Hỗ trợ file Excel (.xlsx, .xls) và CSV
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => document.getElementById("file-upload")?.click()}
                                        disabled={isLoading}
                                    >
                                        Chọn file
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="validate-mode"
                                    checked={validateOnly}
                                    onCheckedChange={setValidateOnly}
                                    disabled={isLoading}
                                />
                                <Label htmlFor="validate-mode">
                                    Chỉ kiểm tra (không thay đổi dữ liệu)
                                </Label>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleImport}
                                    disabled={!file || isLoading}
                                    className="flex-1"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {validateOnly ? "Xác thực sản phẩm" : "Nhập dữ liệu sản phẩm"}
                                </Button>

                                <div className="dropdown dropdown-end">
                                    <Button
                                        variant="outline"
                                        disabled={isLoading}
                                        onClick={() => downloadTemplate("xlsx")}
                                    >
                                        <ArrowUpFromLine className="mr-2 h-4 w-4" />
                                        Tải xuống mẫu
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Phần kết quả import */}
                {importResult && (
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Kết quả import</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Tỷ lệ thành công</span>
                                        <span>{Math.round((importResult.successCount / importResult.totalItems) * 100)}%</span>
                                    </div>
                                    <Progress
                                        value={(importResult.successCount / importResult.totalItems) * 100}
                                        className={importResult.errorCount > 0 ? "bg-amber-100" : "bg-green-100"}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border rounded p-3 text-center">
                                        <p className="text-sm text-gray-500">Tổng số sản phẩm</p>
                                        <p className="text-2xl font-bold">{importResult.totalItems}</p>
                                    </div>
                                    <div className="border rounded p-3 text-center">
                                        <p className="text-sm text-gray-500">Thành công</p>
                                        <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                                    </div>
                                    <div className="border rounded p-3 text-center">
                                        <p className="text-sm text-gray-500">Lỗi</p>
                                        <p className="text-2xl font-bold text-red-500">{importResult.errorCount}</p>
                                    </div>

                                    {!validateOnly && (
                                        <div className="border rounded p-3 text-center">
                                            <p className="text-sm text-gray-500">Actions Completed</p>
                                            <div className="flex justify-around text-xs">
                                                <span className="text-green-500">+{importResult.addedCount}</span>
                                                <span className="text-blue-500">↻{importResult.updatedCount}</span>
                                                <span className="text-red-500">-{importResult.deletedCount}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Phần hiển thị lỗi */}
            {importResult && importResult.errors.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center mb-4">
                        <FileWarning className="h-5 w-5 text-amber-500 mr-2" />
                        <h3 className="text-lg font-medium">Lỗi khi import</h3>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Line</TableHead>
                                    <TableHead>Error Message</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}`r`n
                                {importResult.errors.map((error: any, index: any) => {
                                    // Extract row number if present in the error message
                                    const rowMatch = error.match(/Row (\d+):/);
                                    const rowNum = rowMatch ? rowMatch[1] : "N/A";

                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{rowNum}</TableCell>
                                            <TableCell>{error}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}